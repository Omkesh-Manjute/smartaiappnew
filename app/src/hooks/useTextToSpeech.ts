import { useState, useCallback, useRef, useEffect } from 'react';
import { getSarvamAudio } from '@/services/sarvamAPI';
import type { SarvamAudioChunk } from '@/services/sarvamAPI';
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
    .replace(/^[-*]\s+/gm, '') // Remove list bullets at start of lines
    .replace(/[ \t]+/g, ' ')   // Replace multiple spaces/tabs with single space (preserves \n)
    .trim();
};

interface UseTextToSpeechReturn {
  speak: (text: string, langHint?: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  currentCharIndex: number;
  currentSentenceIndex: number;
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
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Refs for audio management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueue = useRef<SarvamAudioChunk[]>([]);
  const isPlayingQueue = useRef(false);
  const lastRequestId = useRef<number>(0);
  // Store the global start index of the current chunk so we can offset properly
  const currentChunkGlobalOffset = useRef<number>(0);

  const supported = typeof window !== 'undefined' && ('speechSynthesis' in window);

  // Helper to find the best available Hindi/English voice
  const findBestVoice = useCallback((availableVoices: SpeechSynthesisVoice[], langHint: string, text?: string) => {
    const hasHindiChar = text ? /[\u0900-\u097F]/.test(text) : false;
    const mentionsHindi = text ? /\bhindi\b/i.test(text) : false;
    const isHindi = langHint.startsWith('hi') || hasHindiChar || mentionsHindi;
    
    // Filter voices strictly by language
    const targetVoices = availableVoices.filter(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      if (isHindi) return vLang.startsWith('hi') || vLang.startsWith('hin');
      return vLang.startsWith('en');
    });
    
    if (targetVoices.length === 0) {
      if (isHindi) {
        // Fallback to any Indian voice if no direct Hindi match
        const anyIndian = availableVoices.find(v => v.lang.toLowerCase().includes('in'));
        if (anyIndian) return anyIndian;
      }
      return null;
    }

    // Sort voices by quality preference
    targetVoices.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aLang = a.lang.toLowerCase();
      const bLang = b.lang.toLowerCase();

      // 1. Prioritize Microsoft Online Natural voices (if in Edge)
      const aNatural = aName.includes('online') || aName.includes('natural');
      const bNatural = bName.includes('online') || bName.includes('natural');
      if (aNatural && !bNatural) return -1;
      if (!aNatural && bNatural) return 1;

      // 2. Prioritize Google voices (if in Chrome)
      const aGoogle = aName.includes('google');
      const bGoogle = bName.includes('google');
      if (aGoogle && !bGoogle) return -1;
      if (!aGoogle && bGoogle) return 1;

      // 3. For English, prioritize Indian English accents
      if (!isHindi) {
        const aIN = aLang.includes('in');
        const bIN = bLang.includes('in');
        if (aIN && !bIN) return -1;
        if (!aIN && bIN) return 1;
      }

      return 0;
    });

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
    setCurrentSentenceIndex(-1);
  }, []);

  // Sequential playback for audio chunks
  const playNextInQueue = useCallback((cleanedText: string) => {
    if (audioQueue.current.length === 0) {
      setIsSpeaking(false);
      isPlayingQueue.current = false;
      setCurrentCharIndex(-1);
      return;
    }

    const nextChunk = audioQueue.current.shift();
    if (!nextChunk) return;

    // Calculate global offset for this chunk
    const chunkIndexPos = cleanedText.indexOf(nextChunk.text, currentChunkGlobalOffset.current);
    if (chunkIndexPos !== -1) {
      currentChunkGlobalOffset.current = chunkIndexPos;
    }

    // Use a fresh audio element for each chunk to avoid issues with some browsers
    const audio = new Audio(`data:audio/wav;base64,${nextChunk.audio}`);
    audioRef.current = audio;
    
    audio.onplay = () => {
      setIsSpeaking(true);
      isPlayingQueue.current = true;
    };

    audio.ontimeupdate = () => {
      // Simulate currentCharIndex based on playback progress
      if (audio.duration && audio.duration > 0 && currentChunkGlobalOffset.current !== -1) {
        const progress = audio.currentTime / audio.duration;
        const simulatedIndex = currentChunkGlobalOffset.current + Math.floor(progress * nextChunk.text.length);
        setCurrentCharIndex(simulatedIndex);
      }
    };

    audio.onended = () => {
      currentChunkGlobalOffset.current += nextChunk.text.length;
      playNextInQueue(cleanedText);
    };

    audio.onerror = (e) => {
      console.error('Audio chunk error:', e);
      // Skip bad chunk
      currentChunkGlobalOffset.current += nextChunk.text.length;
      playNextInQueue(cleanedText);
    };

    audio.play().catch(err => {
      console.error('Audio playback failed:', err);
      // If play fails (e.g. user hasn't interacted), we stop the queue
      setIsSpeaking(false);
      isPlayingQueue.current = false;
      setCurrentCharIndex(-1);
      setCurrentSentenceIndex(-1);
    });
  }, []);

  const playBrowserTTS = useCallback((text: string, langHint: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // 1. Split text into manageable chunks (sentences) to prevent browser-specific length issues
    // Using a regex that handles English and Hindi (। is the Hindi full stop)
    const chunks = text.match(/[^.!?।]+[.!?।]?\s*/g) || [text];
    let currentChunkIndex = 0;
    let totalCharOffset = 0;

    const speakNextChunk = () => {
      // If we reached the end
      if (currentChunkIndex >= chunks.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentCharIndex(-1);
        setCurrentSentenceIndex(-1);
        return;
      }

      const chunk = chunks[currentChunkIndex];
      // Skip empty chunks
      if (!chunk.trim()) {
        currentChunkIndex++;
        speakNextChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      const bestVoice = findBestVoice(window.speechSynthesis.getVoices(), langHint, chunk);
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      const isHindi = langHint.startsWith('hi') || (bestVoice && bestVoice.lang.startsWith('hi'));
      utterance.rate = isHindi ? 0.85 : rate;
      utterance.pitch = 1.0;
      utterance.lang = bestVoice ? bestVoice.lang : langHint;

      utterance.onstart = () => {
        // First chunk start
        if (currentChunkIndex === 0) {
          setIsSpeaking(true);
        }
        setCurrentSentenceIndex(currentChunkIndex);
      };

      utterance.onend = () => {
        totalCharOffset += chunk.length;
        currentChunkIndex++;
        speakNextChunk();
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setCurrentCharIndex(totalCharOffset + event.charIndex);
        }
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis Chunk Error:', e.error, 'Reason:', e.type, 'on text:', chunk);
        // Fallback for network errors on Google voices
        if (e.error === 'network' && utterance.voice?.name.includes('Google')) {
          console.warn('Network voice failed, falling back to local voice...');
          utterance.voice = null; 
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentCharIndex(-1);
          setCurrentSentenceIndex(-1);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
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
    setCurrentSentenceIndex(-1);

    // 3. Try Sarvam AI PREMIUM Option (Dynamic Config)
    try {
      const dbSettings = await SystemSettingsService.getSettings();
      const sarvamKey = dbSettings.sarvam_api_key || import.meta.env.VITE_SARVAM_API_KEY;
      
      const USE_SARVAM = false; // User requested to strictly use Web Speech API fallback
      if (USE_SARVAM && sarvamKey && sarvamKey.trim() !== '') {
        const isHindi = targetLang.startsWith('hi');
        const audioChunks = await getSarvamAudio(cleanedText, isHindi ? 'hi' : 'en', {
          apiKey: sarvamKey,
          speaker: isHindi ? 'anushka' : 'abhilash', // Use valid Sarvam speakers
          model: 'bulbul:v2'
        });

        // 4. CHECK: Only proceed if this is still the most recent request
        if (requestId !== lastRequestId.current) {
          console.warn('Speak request invalidated by a newer request or stop call');
          return;
        }

        if (audioChunks && audioChunks.length > 0) {
          audioQueue.current = [...audioChunks];
          currentChunkGlobalOffset.current = 0;
          playNextInQueue(cleanedText);
          return;
        }
      }
    } catch (dbErr) {
      console.warn('DB Settings error, falling back to browser TTS:', dbErr);
    }

    // 5. Fallback if request is still valid
    if (requestId === lastRequestId.current) {
      // Small delay after cancel() to ensure browser state is ready
      setTimeout(() => {
        if (requestId === lastRequestId.current) {
          playBrowserTTS(cleanedText, targetLang);
        }
      }, 50);
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
    currentSentenceIndex,
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
