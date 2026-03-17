import { useState, useCallback, useRef, useEffect } from 'react';

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

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!supported) return;

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
  }, [supported, selectedVoice]);

  const speak = useCallback((text: string, langHint?: string) => {
    if (!supported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const cleanedText = cleanContentForSpeech(text);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
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
  }, [supported, rate, selectedVoice, voices]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

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
