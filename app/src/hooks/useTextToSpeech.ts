import { useState, useCallback, useRef, useEffect } from 'react';
import { getSarvamAudio } from '@/services/sarvamAPI';
import { SystemSettingsService } from '@/services/SystemSettingsService';

export const cleanTextForTTS = (text: string) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '') // Remove hashtags (headings)
    .replace(/[-*]{3,}/g, ' ') // Remove horizontal rules --- or ***
    .replace(/[*_~`]/g, '')    // Remove other markdown symbols
    .replace(/\bHindi\b/g, 'हिन्दी')
    .replace(/\bhindi\b/g, 'हिन्दी')
    .replace(/\(/g, ', ')
    .replace(/\)/g, ', ')
    .replace(/\b-\b/g, ' ')    // Replace single dashes between words with space (to avoid "minus")
    .replace(/\s+/g, ' ')
    .trim();
};

interface UseTextToSpeechReturn {
  speak: (text: string, langHint?: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  currentCharIndex: number;
  pause: () => void;
  resume: () => void;
  supported: boolean;
  rate: number;
  setRate: (rate: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Refs for audio management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueue = useRef<string[]>([]);
  const isPlayingQueue = useRef(false);
  const lastRequestId = useRef<number>(0);

  const supported = typeof window !== 'undefined' && ('speechSynthesis' in window);

  // Helper to find the best available Hindi/English voice
  const findBestVoice = useCallback((availableVoices: SpeechSynthesisVoice[], langHint: string, text?: string) => {
    const hasHindiChar = text ? /[\u0900-\u097F]/.test(text) : false;
    const mentionsHindi = text ? /\bhindi\b/i.test(text) : false;
    const isHindi = langHint.startsWith('hi') || hasHindiChar || mentionsHindi;
    
    const targetVoices = availableVoices.filter(v => {
      const vLang = v.lang.toLowerCase();
      if (isHindi) return vLang.startsWith('hi') || vLang.startsWith('hin');
      // For English, prioritize Indian English (en-IN) if possible
      return vLang.startsWith('en');
    });
    
    if (targetVoices.length === 0) {
      if (isHindi) {
        const anyIndian = availableVoices.find(v => v.lang.toLowerCase().includes('in'));
        if (anyIndian) return anyIndian;
      }
      return null;
    }

    // Sort to prioritize en-IN voices for English
    if (!isHindi) {
      targetVoices.sort((a, b) => {
        const aIN = a.lang.toLowerCase().includes('in');
        const bIN = b.lang.toLowerCase().includes('in');
        if (aIN && !bIN) return -1;
        if (!aIN && bIN) return 1;
        return 0;
      });
    }

    const googleVoice = targetVoices.find(v => v.name.includes('Google') && (isHindi ? (v.lang.includes('IN') || v.name.includes('हिन्दी')) : v.lang.includes('IN')));
    if (googleVoice) return googleVoice;

    const naturalVoice = targetVoices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('hi-in-') || v.name.toLowerCase().includes('en-in-'));
    if (naturalVoice) return naturalVoice;

    return targetVoices[0];
  }, []);

  const updateVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      if (!selectedVoice) {
         setSelectedVoice(findBestVoice(availableVoices, 'en-US'));
      }
    }
  }, [findBestVoice, selectedVoice]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [updateVoices]);

  const stop = useCallback(() => {
    // Increment request ID to invalidate any pending async speak calls
    lastRequestId.current += 1;

    // 1. Stop HTML Audio Queue
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    audioQueue.current = [];
    isPlayingQueue.current = false;

    // 2. Stop Browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentCharIndex(-1);
  }, []);

  // Sequential playback for audio chunks
  const playNextInQueue = useCallback(() => {
    if (audioQueue.current.length === 0) {
      setIsSpeaking(false);
      isPlayingQueue.current = false;
      return;
    }

    const nextChunk = audioQueue.current.shift();
    if (!nextChunk) return;

    // Use a fresh audio element for each chunk to avoid issues with some browsers
    const audio = new Audio(`data:audio/wav;base64,${nextChunk}`);
    audioRef.current = audio;
    
    audio.onplay = () => {
      setIsSpeaking(true);
      isPlayingQueue.current = true;
    };

    audio.onended = () => {
      playNextInQueue();
    };

    audio.onerror = (e) => {
      console.error('Audio chunk error:', e);
      // Skip bad chunk
      playNextInQueue();
    };

    audio.play().catch(err => {
      console.error('Audio playback failed:', err);
      // If play fails (e.g. user hasn't interacted), we stop the queue
      setIsSpeaking(false);
      isPlayingQueue.current = false;
    });
  }, []);

  const playBrowserTTS = useCallback((text: string, lang: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = findBestVoice(window.speechSynthesis.getVoices(), lang, text);
    
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    const isHindi = lang.startsWith('hi') || (bestVoice && bestVoice.lang.startsWith('hi'));
    utterance.rate = isHindi ? 0.85 : rate;
    utterance.pitch = 1.0;
    utterance.lang = bestVoice ? bestVoice.lang : lang;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentCharIndex(-1);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentCharIndex(-1);
    };
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentCharIndex(event.charIndex);
      }
    };
    utterance.onerror = (e) => {
      console.error('SpeechSynthesis Error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentCharIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  }, [findBestVoice, rate]);

  const speak = useCallback(async (text: string, langHint?: string) => {
    // 1. Stop everything immediately
    stop();
    const requestId = lastRequestId.current;

    if (!text) return;
    const cleanedText = cleanTextForTTS(text);
    const hasHindiChar = /[\u0900-\u097F]/.test(cleanedText);
    const targetLang = langHint || (hasHindiChar ? 'hi-IN' : 'en-US');

    // 2. Set UI State to speaking immediately so "Stop" button shows up
    setIsSpeaking(true);
    setCurrentCharIndex(-1);

    // 3. Try Sarvam AI PREMIUM Option (Dynamic Config)
    try {
      const dbSettings = await SystemSettingsService.getSettings();
      const sarvamKey = dbSettings.sarvam_api_key || import.meta.env.VITE_SARVAM_API_KEY;
      
      if (sarvamKey) {
        const audioChunks = await getSarvamAudio(cleanedText, hasHindiChar ? 'hi' : 'en', {
          apiKey: sarvamKey,
          speaker: dbSettings.sarvam_speaker,
          model: dbSettings.sarvam_model
        });

        // 4. CHECK: Only proceed if this is still the most recent request
        if (requestId !== lastRequestId.current) {
          console.warn('Speak request invalidated by a newer request or stop call');
          return;
        }

        if (audioChunks && audioChunks.length > 0) {
          audioQueue.current = [...audioChunks];
          playNextInQueue();
          return;
        }
      }
    } catch (dbErr) {
      console.warn('DB Settings error, falling back to browser TTS:', dbErr);
    }

    // 5. Fallback if request is still valid
    if (requestId === lastRequestId.current) {
      playBrowserTTS(cleanedText, targetLang);
    }
  }, [stop, playBrowserTTS, playNextInQueue]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isPaused,
    currentCharIndex,
    pause,
    resume,
    supported,
    rate,
    setRate,
    voices,
    selectedVoice,
    setSelectedVoice,
  };
};
