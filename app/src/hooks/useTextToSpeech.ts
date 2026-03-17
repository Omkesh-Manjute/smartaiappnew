import { useState, useCallback, useRef, useEffect } from 'react';
import { getSarvamAudio } from '@/services/sarvamAPI';

interface UseTextToSpeechReturn {
  speak: (text: string, lang?: string) => void;
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

const cleanContentForSpeech = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/#{1,6}\s+(.*?)\n/g, '$1 ') // Remove headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // Remove links
    .replace(/`{1,3}.*?`{1,3}/gs, '')    // Remove code blocks
    .replace(/(\*|\d+\.) /g, '')         // Remove list markers
    .replace(/\s+/g, ' ')                // Consolidate whitespace
    .trim();
};

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSarvamPlaying, setIsSarvamPlaying] = useState(false);

  const supported = typeof window !== 'undefined' && ('speechSynthesis' in window || !!audioRef);

  // Load available voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Default selection strategy
        const defaultVoice = availableVoices.find(
          (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
        ) || availableVoices.find(
          (v) => v.lang.startsWith('en')
        ) || availableVoices[0];
        
        if (!selectedVoice) setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const stop = useCallback(() => {
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Stop Sarvam Audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    setIsSpeaking(false);
    setIsPaused(false);
    setIsSarvamPlaying(false);
  }, []);

  const speak = useCallback(async (text: string, langHint?: string) => {
    // Cancel any ongoing speech
    stop();

    const cleanedText = cleanContentForSpeech(text);
    if (!cleanedText) return;

    // 1. Try Sarvam AI first if hint is Hindi or general
    const sarvamApiKey = import.meta.env.VITE_SARVAM_API_KEY;
    if (sarvamApiKey) {
      const lang = langHint === 'hi' ? 'hi' : 'en';
      const audioData = await getSarvamAudio(cleanedText, lang);
      
      if (audioData) {
        const audio = new Audio(audioData);
        audioRef.current = audio;
        
        audio.onplay = () => {
          setIsSpeaking(true);
          setIsSarvamPlaying(true);
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          setIsSarvamPlaying(false);
        };
        
        audio.onerror = () => {
          console.error('Sarvam Audio playback error, falling back to browser TTS');
          setIsSarvamPlaying(false);
          // FALLBACK to browser TTS
          playBrowserTTS(cleanedText, langHint);
        };

        audio.play();
        return;
      }
    }

    // 2. Fallback to Browser native TTS
    playBrowserTTS(cleanedText, langHint);
  }, [stop]);

  const playBrowserTTS = (text: string, langHint?: string) => {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a language-specific voice if hint provided
    if (langHint) {
      const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langHint.toLowerCase()));
      if (langVoices.length > 0) {
        const preferred = langVoices.find(v => v.name.toLowerCase().includes('google')) || langVoices[0];
        utterance.voice = preferred;
      }
    } else if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = useCallback(() => {
    if (isSarvamPlaying && audioRef.current) {
      audioRef.current.pause();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
  }, [isSarvamPlaying]);

  const resume = useCallback(() => {
    if (isSarvamPlaying && audioRef.current) {
      audioRef.current.play();
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setIsPaused(false);
  }, [isSarvamPlaying]);

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
