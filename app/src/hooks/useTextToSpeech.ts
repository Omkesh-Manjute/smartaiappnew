import { useState, useCallback, useRef, useEffect } from 'react';
import { getSarvamAudio } from '@/services/sarvamAPI';
import { SystemSettingsService } from '@/services/SystemSettingsService';

interface UseTextToSpeechReturn {
  speak: (text: string, langHint?: string) => Promise<void>;
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
  const findBestVoice = useCallback((availableVoices: SpeechSynthesisVoice[], langHint: string, text?: string) => {
    // Hinglish detection: if text is provided, check if it contains Devanagari or mentions Hindi
    const hasHindiChar = text ? /[\u0900-\u097F]/.test(text) : false;
    const mentionsHindi = text ? /\bhindi\b/i.test(text) : false;
    const isHindi = langHint.startsWith('hi') || hasHindiChar || mentionsHindi;
    
    console.log('Voice Search Context:', { langHint, isHindi, hasHindiChar, mentionsHindi });
    
    // Log all voices once for triage
    if (availableVoices.length > 0 && Math.random() < 0.2) {
       console.log('Available Voices Table:');
       console.table(availableVoices.map(v => ({ name: v.name, lang: v.lang })));
    }

    const targetVoices = availableVoices.filter(v => {
      const vLang = v.lang.toLowerCase();
      if (isHindi) return vLang.startsWith('hi') || vLang.startsWith('hin');
      return vLang.startsWith('en');
    });
    
    if (targetVoices.length === 0) {
      console.warn('No voices found for target lang:', isHindi ? 'Hindi' : 'English');
      if (isHindi) {
        // Fallback to ANY voice with 'IN' in the name/lang if Hindi specifically isn't found
        const anyIndian = availableVoices.find(v => v.lang.toLowerCase().includes('in'));
        if (anyIndian) return anyIndian;
      }
      return null;
    }

    // Priority 1: Google Natural Voices
    const googleVoice = targetVoices.find(v => v.name.includes('Google') && (isHindi ? (v.lang.includes('IN') || v.name.includes('हिन्दी')) : true));
    if (googleVoice) return googleVoice;

    // Priority 2: Microsoft/Edge Natural
    const naturalVoice = targetVoices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('hi-in-'));
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
    console.log('Playing Browser TTS:', { lang, textShort: text.substring(0, 30) });
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const bestVoice = findBestVoice(window.speechSynthesis.getVoices(), lang, text);
    
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log('Selected optimized voice:', bestVoice.name, '(' + bestVoice.lang + ')');
    }

    // Calibrate for language
    const isHindi = lang.startsWith('hi') || (bestVoice && bestVoice.lang.startsWith('hi'));
    utterance.rate = isHindi ? 0.85 : rate;
    utterance.pitch = 1.0;
    utterance.lang = bestVoice ? bestVoice.lang : lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = (e) => {
      console.error('SpeechSynthesis Error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [findBestVoice, rate]);

  const speak = useCallback(async (text: string, langHint?: string) => {
    console.log('TTS Speak called:', { textShort: text.substring(0, 30), langHint });
    stop();

    if (!text) return;
    const cleanedText = text.replace(/[*_~`#]/g, '').trim();
    const hasHindiChar = /[\u0900-\u097F]/.test(cleanedText);
    const targetLang = langHint || (hasHindiChar ? 'hi-IN' : 'en-US');

    // 1. Try Sarvam AI PREMIUM Option (Dynamic Config)
    try {
      const dbSettings = await SystemSettingsService.getSettings();
      const sarvamKey = dbSettings.sarvam_api_key || import.meta.env.VITE_SARVAM_API_KEY;
      
      if (sarvamKey) {
        const audioData = await getSarvamAudio(cleanedText, hasHindiChar ? 'hi' : 'en', {
          apiKey: sarvamKey,
          speaker: dbSettings.sarvam_speaker,
          model: dbSettings.sarvam_model
        });

        if (audioData) {
          const audio = new Audio(audioData);
          audioRef.current = audio;
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
          audio.onerror = (e) => {
            console.error('Sarvam audio element error:', e);
            playBrowserTTS(cleanedText, targetLang);
          };
          audio.play().catch(err => {
            console.error('Audio play prompt failed:', err);
            playBrowserTTS(cleanedText, targetLang);
          });
          return;
        }
      }
    } catch (dbErr) {
      console.warn('DB Settings error, falling back to .env:', dbErr);
    }

    // 2. Free Fallback
    playBrowserTTS(cleanedText, targetLang);
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
