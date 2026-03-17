import { useState, useCallback, useRef, useEffect } from 'react';
import { getSarvamAudio } from '@/services/sarvamAPI';

interface UseTextToSpeechReturn {
  speak: (text: string, lang?: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
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
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const supported = typeof window !== 'undefined' && ('speechSynthesis' in window);

  // Helper to find the best available Hindi/English voice
  const findBestVoice = useCallback((voices: SpeechSynthesisVoice[], lang: string) => {
    const isHindi = lang.startsWith('hi');
    const targetVoices = voices.filter(v => v.lang.startsWith(isHindi ? 'hi' : 'en'));
    
    if (targetVoices.length === 0) return null;

    // Priority 1: Google Natural Voices (Usually best in Chrome)
    const googleVoice = targetVoices.find(v => v.name.includes('Google') && (isHindi ? v.lang.includes('IN') : true));
    if (googleVoice) return googleVoice;

    // Priority 2: Microsoft/Natural Voices (Good in Edge/Windows)
    const naturalVoice = targetVoices.find(v => v.name.includes('Natural') || v.name.includes('Microsoft'));
    if (naturalVoice) return naturalVoice;

    // Priority 3: Premium voices
    const premiumVoice = targetVoices.find(v => v.name.includes('Premium') || v.name.includes('Enhanced'));
    if (premiumVoice) return premiumVoice;

    // Fallback: First available for that language
    return targetVoices[0];
  }, []);

  const updateVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    
    // Auto-select a good default if none selected
    if (!selectedVoice && availableVoices.length > 0) {
      const defaultVoice = findBestVoice(availableVoices, 'en-US');
      setSelectedVoice(defaultVoice);
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const playBrowserTTS = useCallback((text: string, lang: string) => {
    console.log('Playing Browser TTS (Free Mode):', { text: text.substring(0, 50), lang });
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Safety clear

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use selected voice if it matches the current language, otherwise find the best for this lang
    let voiceToUse = selectedVoice;
    if (!voiceToUse || !voiceToUse.lang.startsWith(lang.substring(0, 2))) {
      voiceToUse = findBestVoice(window.speechSynthesis.getVoices(), lang);
    }
    
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      console.log('Selected voice:', voiceToUse.name);
    }

    // Natural parameters for Hindi/English
    utterance.rate = lang.startsWith('hi') ? 0.85 : rate; // Slightly slower for clear Hindi
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    window.speechSynthesis.speak(utterance);
  }, [findBestVoice, rate, selectedVoice]);

  const speak = useCallback(async (text: string, langHint?: string) => {
    console.log('TTS Speak called:', { text: text.substring(0, 50), langHint });
    stop();

    if (!text) return;
    const cleanedText = text.replace(/[*_~`#]/g, '').trim();
    const isHindi = /[\u0900-\u097F]/.test(cleanedText);
    const lang = langHint || (isHindi ? 'hi-IN' : 'en-US');

    // 1. Try Sarvam AI IF API key exists (Premium Option)
    const sarvamApiKey = import.meta.env.VITE_SARVAM_API_KEY;
    if (sarvamApiKey) {
      const audioData = await getSarvamAudio(cleanedText, isHindi ? 'hi' : 'en');
      if (audioData) {
        const audio = new Audio(audioData);
        audioRef.current = audio;
        
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audio.onerror = (e) => {
          console.error('Sarvam audio playback error, falling back:', e);
          playBrowserTTS(cleanedText, lang);
        };

        audio.play().catch(e => {
          console.error('Audio play failed:', e);
          playBrowserTTS(cleanedText, lang);
        });
        return;
      }
    }

    // 2. Optimized Browser Native TTS (Free & High Quality Fallback)
    playBrowserTTS(cleanedText, lang);
  }, [stop, playBrowserTTS]);

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
      audioRef.current.play();
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
