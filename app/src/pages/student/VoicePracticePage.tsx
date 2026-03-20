import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { voicePracticeDB } from '@/services/supabaseDB';
import { useGamification } from '@/contexts/GamificationContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  RefreshCw,
  AlertTriangle,
  Type,
  BookText,
  AudioLines,
  Trophy,
  TrendingUp,
  Target,
  Languages,
} from 'lucide-react';

type PracticeMode = 'word' | 'sentence' | 'paragraph';

type PromptItem = {
  id: string;
  mode: PracticeMode;
  text: string;
  hint: string;
  targetWpm: number;
};

type FeedbackResult = {
  overall: number;
  pronunciation: number;
  completeness: number;
  fluency: number;
  wpm: number;
  message: string;
  tips: string[];
  missedWords: string[];
  extraWords: string[];
  aiTips?: string[];
  syllableHints?: string;
  aiComment?: string;
};

type PracticeRecord = {
  id: string;
  studentId: string;
  questionId: string;
  question: string;
  recordedAnswer: string;
  score: number;
  feedback: string;
  practicedAt: Date;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: Array<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
  maxAlternatives?: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const PROMPTS: Record<PracticeMode, PromptItem[]> = {
  word: [
    { id: 'w1', mode: 'word', text: 'comfortable', hint: 'com-for-ta-ble', targetWpm: 50 },
    { id: 'w2', mode: 'word', text: 'entrepreneur', hint: 'on-truh-pruh-nur', targetWpm: 50 },
    { id: 'w3', mode: 'word', text: 'responsibility', hint: 'Speak each syllable', targetWpm: 50 },
    { id: 'w4', mode: 'word', text: 'opportunity', hint: 'op-por-TU-ni-ty', targetWpm: 50 },
    { id: 'w5', mode: 'word', text: 'pronunciation', hint: 'Clear vowel sounds', targetWpm: 50 },
    { id: 'w6', mode: 'word', text: 'temperature', hint: 'tem-per-a-ture', targetWpm: 50 },
  ],
  sentence: [
    { id: 's1', mode: 'sentence', text: 'I am improving my English speaking skills every day.', hint: 'Keep a steady pace', targetWpm: 95 },
    { id: 's2', mode: 'sentence', text: 'Practice makes progress, so I speak confidently in class.', hint: 'Emphasize confidence', targetWpm: 95 },
    { id: 's3', mode: 'sentence', text: 'Could you please explain this concept in a simple way?', hint: 'Use polite tone', targetWpm: 95 },
    { id: 's4', mode: 'sentence', text: 'Technology helps students learn faster and smarter.', hint: 'Don\'t rush the end', targetWpm: 95 },
    { id: 's5', mode: 'sentence', text: 'My goal is to speak fluently in interviews.', hint: 'Stress key words', targetWpm: 95 },
  ],
  paragraph: [
    { id: 'p1', mode: 'paragraph', text: 'Good communication is an essential life skill. When we speak clearly, people understand our ideas better. Regular practice can improve pronunciation and fluency.', hint: 'Pause after each sentence', targetWpm: 120 },
    { id: 'p2', mode: 'paragraph', text: 'Learning English becomes easier when you practice daily. You can read articles aloud, record your voice, and compare your speech with native pronunciation.', hint: 'Maintain consistent speed', targetWpm: 120 },
    { id: 'p3', mode: 'paragraph', text: 'During public speaking, your voice should be clear, calm, and expressive. Use pauses to separate ideas. A confident voice creates a strong impression.', hint: 'Expressive reading', targetWpm: 120 },
  ],
};

const modeConfig: Record<PracticeMode, { label: string; icon: typeof Type; color: string; bgColor: string }> = {
  word: { label: 'Word Drill', icon: Type, color: 'text-blue-600', bgColor: 'bg-blue-500' },
  sentence: { label: 'Sentence', icon: AudioLines, color: 'text-purple-600', bgColor: 'bg-purple-500' },
  paragraph: { label: 'Paragraph', icon: BookText, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
};

const normalizeText = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();

const tokenize = (text: string): string[] => normalizeText(text).split(' ').filter(Boolean);

const levenshteinDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
};

const evaluateSpeech = (
  expectedText: string,
  spokenText: string,
  mode: PracticeMode,
  durationSeconds: number,
  targetWpm: number
): FeedbackResult => {
  const expectedNorm = normalizeText(expectedText);
  const spokenNorm = normalizeText(spokenText);
  const expectedWords = tokenize(expectedText);
  const spokenWords = tokenize(spokenText);

  const maxLen = Math.max(expectedNorm.length, spokenNorm.length, 1);
  const editDistance = levenshteinDistance(expectedNorm, spokenNorm);
  const pronunciation = Math.max(0, Math.round((1 - editDistance / maxLen) * 100));

  const expectedCounts = new Map<string, number>();
  expectedWords.forEach((word) => expectedCounts.set(word, (expectedCounts.get(word) ?? 0) + 1));

  let matched = 0;
  spokenWords.forEach((word) => {
    const count = expectedCounts.get(word) ?? 0;
    if (count > 0) { matched += 1; expectedCounts.set(word, count - 1); }
  });

  const missedWords: string[] = [];
  expectedCounts.forEach((count, word) => { for (let i = 0; i < count; i++) missedWords.push(word); });

  const completeness = expectedWords.length ? Math.round((matched / expectedWords.length) * 100) : 0;

  const safeDuration = Math.max(durationSeconds, 1);
  const wpm = Math.round((spokenWords.length / safeDuration) * 60);
  const fluencyPenalty = Math.min(100, Math.round(Math.abs(wpm - targetWpm) * 1.2));
  const fluency = Math.max(0, 100 - fluencyPenalty);

  const modeWeight = mode === 'word' ? 0.55 : mode === 'sentence' ? 0.5 : 0.45;
  const overall = Math.max(0, Math.min(100, Math.round(
    pronunciation * modeWeight + completeness * 0.35 + fluency * (1 - modeWeight - 0.35)
  )));

  const tips: string[] = [];
  if (pronunciation < 75) tips.push('Speak slower and exaggerate vowel sounds');
  if (completeness < 80) tips.push('Try to include all words from the prompt');
  if (fluency < 70) tips.push(`Aim for a natural pace near ${targetWpm} WPM`);
  if (missedWords.length > 0) tips.push(`Practice these: ${missedWords.slice(0, 5).join(', ')}`);
  if (tips.length === 0) tips.push('Excellent delivery! Keep it up');

  const message = overall >= 90 ? 'Outstanding! Native-like pronunciation!' :
    overall >= 75 ? 'Great job! You are improving well.' :
    overall >= 60 ? 'Good effort! Focus on clarity.' :
    'Keep practicing! Slow down and speak clearly.';

  return { overall, pronunciation, completeness, fluency, wpm, message, tips, missedWords, extraWords: [] };
};

const VoicePracticePage = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();
  const { speak, stop: stopSpeech, isSpeaking, supported: ttsSupported } = useTextToSpeech();

  const [mode, setMode] = useState<PracticeMode>('sentence');
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem>(PROMPTS.sentence[0]);
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);

  const [isSupported, setIsSupported] = useState(true);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [history, setHistory] = useState<PracticeRecord[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalTranscriptRef = useRef('');
  const interimRef = useRef('');
  const sessionStartRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);

  const activePromptText = useMemo(() => {
    const text = customText.trim();
    return useCustomText && text ? text : currentPrompt.text;
  }, [customText, useCustomText, currentPrompt]);

  const activeTargetWpm = useMemo(() => {
    if (useCustomText && customText.trim()) {
      return mode === 'word' ? 55 : mode === 'sentence' ? 95 : 120;
    }
    return currentPrompt.targetWpm;
  }, [useCustomText, customText, currentPrompt]);

  const stats = useMemo(() => {
    const total = history.length;
    const avg = total ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / total) : 0;
    const best = total ? Math.max(...history.map((item) => item.score)) : 0;
    return { total, avg, best };
  }, [history]);

  // Load history
  useEffect(() => {
    if (!user) return;
    voicePracticeDB.getByStudent(user.id).then((records: any[]) => {
      setHistory(records.map((item) => ({
        ...item,
        practicedAt: item.practicedAt instanceof Date ? item.practicedAt : new Date(item.practicedAt),
      })));
    }).catch(console.error);
  }, [user]);

  // Check speech recognition support
  useEffect(() => {
    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    if (!hasRecognition) {
      setIsSupported(false);
      toast.error('Speech recognition not supported. Please use Chrome or Edge browser.');
    }
  }, []);

  // Audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(Math.min(100, average / 1.5));
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isListening]);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    const isHindi = /[\u0900-\u097F]/.test(activePromptText);
    recognition.lang = isHindi ? 'hi-IN' : 'en-US';
    console.log('Recognition lang set to:', recognition.lang);

    recognition.onstart = () => {
      setIsListening(true);
      setIsRecordingComplete(false);
      console.log('Speech recognition started');
      toast.success('Listening... Speak now! 📢');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('Speech recognition result:', event.results);
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += `${result[0].transcript} `;
        } else {
          interimText += `${result[0].transcript} `;
        }
      }

      if (finalText.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim();
        setTranscript(finalTranscriptRef.current);
        console.log('Final transcript:', finalTranscriptRef.current);
      }

      interimRef.current = interimText.trim();
      setInterimTranscript(interimRef.current);
      console.log('Interim transcript:', interimRef.current);

      // Reset silence timer on speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (finalText.trim() || interimText.trim()) {
        silenceTimerRef.current = window.setTimeout(() => {
          if (isListening) {
            console.log('Silence detected, stopping...');
            stopListening();
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        toast.error('Microphone access denied. Please allow in browser settings.');
      } else if (event.error === 'no-speech') {
        console.log('No speech detected - this is normal on mobile sometimes');
        // Don't show error, just continue listening
      } else if (event.error === 'aborted') {
        // User stopped it, ignore
      } else {
        toast.error(`Recognition error: ${event.error}. Please try again.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended. Final:', finalTranscriptRef.current, 'Interim:', interimRef.current);
      setIsListening(false);
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      const spoken = `${finalTranscriptRef.current} ${interimRef.current}`.trim();
      console.log('Total spoken text:', spoken);
      
      if (spoken && spoken.length > 0 && !isRecordingComplete) {
        setIsRecordingComplete(true);
        void evaluateAttempt(spoken);
      } else if (!spoken || spoken.length === 0) {
        toast.error('No speech detected. Please speak clearly and try again. 📢');
      }
    };

    return recognition;
  }, [activePromptText, isRecordingComplete]);

  // Setup audio visualization
  const setupAudioVisualization = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to setup audio visualization:', error);
    }
  };

  const startListening = async () => {
    // Check if on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('Starting voice recording. Mobile:', isMobile);

    // Reinitialize recognition each time for mobile compatibility
    recognitionRef.current = initRecognition();
    
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available. Please use Chrome or Edge browser.');
      return;
    }
    if (!activePromptText.trim()) {
      toast.error('Please enter prompt text first');
      return;
    }

    resetAttemptState();
    sessionStartRef.current = Date.now();

    try {
      // Request microphone permission with mobile-friendly settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      setMicPermission('granted');
      
      // Setup audio visualization
      await setupAudioVisualization(stream);
      
      // Small delay for mobile browsers
      if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start recognition
      recognitionRef.current.start();
    } catch (error: any) {
      console.error('Microphone access error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        toast.error('Microphone access denied. Please allow microphone access and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else {
        toast.error('Could not start microphone. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const resetAttemptState = () => {
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    finalTranscriptRef.current = '';
    interimRef.current = '';
    setIsRecordingComplete(false);
    stopSpeech();
  };

  const changeMode = (newMode: PracticeMode) => {
    setMode(newMode);
    setCurrentPrompt(PROMPTS[newMode][Math.floor(Math.random() * PROMPTS[newMode].length)]);
    setUseCustomText(false);
    setCustomText('');
    resetAttemptState();
  };

  const nextPrompt = () => {
    setCurrentPrompt(PROMPTS[mode][Math.floor(Math.random() * PROMPTS[mode].length)]);
    resetAttemptState();
  };

  const playPrompt = () => {
    if (!ttsSupported) {
      toast.error('Text-to-speech not supported');
      return;
    }
    const isHindi = /[\u0900-\u097F]/.test(activePromptText);
    speak(activePromptText, isHindi ? 'hi' : 'en');
  };

  const evaluateAttempt = async (spokenText: string) => {
    if (!user) return;

    const durationSeconds = sessionStartRef.current ? (Date.now() - sessionStartRef.current) / 1000 : 1;
    const result = evaluateSpeech(activePromptText, spokenText, mode, durationSeconds, activeTargetWpm);
    setFeedback(result);

    const record: PracticeRecord = {
      id: `voice_${Date.now()}`,
      studentId: user.id,
      questionId: useCustomText ? `custom_${mode}` : currentPrompt.id,
      question: activePromptText,
      recordedAnswer: spokenText,
      score: result.overall,
      feedback: result.message,
      practicedAt: new Date(),
    };

    setHistory((prev) => [...prev, record]);
    voicePracticeDB.create(record as any).catch(console.error);

    const xp = result.overall >= 85 ? 40 : result.overall >= 70 ? 25 : 15;
    addXP(xp).then(() => toast.success(`+${xp} XP earned!`)).catch(() => toast.success('Practice complete!'));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8">
          <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Voice Practice Not Supported</h2>
          <p className="text-gray-500 mb-4">Please use Chrome or Edge browser for voice recognition features.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  const currentModeConfig = modeConfig[mode];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Target, label: 'Attempts', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-100' },
            { icon: TrendingUp, label: 'Average', value: `${stats.avg}%`, color: 'text-purple-600', bg: 'bg-purple-100' },
            { icon: Trophy, label: 'Best', value: `${stats.best}%`, color: 'text-amber-600', bg: 'bg-amber-100' },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['word', 'sentence', 'paragraph'] as PracticeMode[]).map((m) => {
            const config = modeConfig[m];
            return (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                  mode === m
                    ? `${config.bgColor} text-white shadow-lg`
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <config.icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Practice Card */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 ${currentModeConfig.bgColor}`} />
          <CardContent className="p-6 space-y-5">
            
            {/* Prompt Display */}
            <div className="text-center space-y-2">
              <Badge variant="outline" className={`${currentModeConfig.color} ${currentModeConfig.bgColor}/10 border-current`}>
                {currentModeConfig.label}
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                {activePromptText}
              </h2>
              <p className="text-sm text-gray-500">Hint: {currentPrompt.hint}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={nextPrompt} className="rounded-xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                New
              </Button>
              <Button 
                variant={isSpeaking ? 'secondary' : 'outline'} 
                onClick={isSpeaking ? stopSpeech : playPrompt}
                className={`rounded-xl ${isSpeaking ? 'bg-red-100 text-red-600' : ''}`}
              >
                {isSpeaking ? (
                  <><Square className="w-4 h-4 mr-2 fill-current" /> Stop</>
                ) : (
                  <><Volume2 className="w-4 h-4 mr-2" /> Listen</>
                )}
              </Button>
            </div>

            {/* Custom Text Toggle */}
            <div className="space-y-3">
              <button
                onClick={() => { setUseCustomText(!useCustomText); resetAttemptState(); }}
                className={`w-full p-3 rounded-xl border-2 border-dashed transition-all text-sm font-medium ${
                  useCustomText ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
              >
                <Languages className="w-4 h-4 inline mr-2" />
                {useCustomText ? 'Using custom text' : 'Use your own text'}
              </button>
              {useCustomText && (
                <Input
                  placeholder="Type your practice text here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="text-center text-lg"
                />
              )}
            </div>

            {/* Mic Permission Warning */}
            {micPermission === 'denied' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
                <MicOff className="w-5 h-5 mx-auto mb-2" />
                <p className="font-medium">Microphone access denied</p>
                <p className="text-xs mt-1">Please allow microphone in browser settings and refresh the page.</p>
              </div>
            )}

            {/* Record Button with Audio Visualization */}
            <div className="text-center py-6">
              {/* Audio Level Bars */}
              <div className="flex items-end justify-center gap-1 h-12 mb-6">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isListening ? [10, audioLevel > 0 ? 20 + Math.random() * (audioLevel / 3) : 10, 10] : 10 }
                    }
                    transition={{ 
                      repeat: isListening ? Infinity : 0, 
                      duration: 0.2 + Math.random() * 0.15,
                      delay: i * 0.03 
                    }}
                    className={`w-2 rounded-full transition-colors ${
                      isListening 
                        ? audioLevel > 50 ? 'bg-red-500' : audioLevel > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Record Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                disabled={!activePromptText.trim() || micPermission === 'denied'}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening 
                    ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/40 animate-pulse' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40 active:scale-95'
                }`}
              >
                {isListening ? (
                  <>
                    <Square className="w-10 h-10 text-white fill-current mb-1" />
                    <span className="text-white text-xs font-medium">STOP</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-12 h-12 text-white mb-1" />
                    <span className="text-white text-xs font-medium">TAP</span>
                  </>
                )}
              </motion.button>

              <div className="mt-6 space-y-1">
                <p className={`text-base font-semibold ${isListening ? 'text-rose-600' : 'text-gray-700'}`}>
                  {isListening ? '🎙️ Recording... Speak Now!' : '👆 Tap to Start Speaking'}
                </p>
                {isListening && (
                  <p className="text-sm text-gray-500 animate-pulse">
                    Say the highlighted text clearly
                  </p>
                )}
                {!isListening && (
                  <p className="text-xs text-gray-400">
                    Make sure your microphone is enabled
                  </p>
                )}
              </div>

              {/* Troubleshooting tips */}
              {micPermission !== 'denied' && !isListening && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl text-left">
                  <p className="text-xs font-medium text-blue-700 mb-1">💡 Tips for better recognition:</p>
                  <ul className="text-xs text-blue-600 space-y-0.5">
                    <li>• Speak clearly and at normal pace</li>
                    <li>• Use Chrome or Edge browser</li>
                    <li>• Allow microphone when prompted</li>
                    <li>• Be in a quiet environment</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Live Transcript */}
            {(transcript || interimTranscript) && (
              <div className="p-4 bg-gray-100 rounded-xl">
                <p className="text-xs text-gray-500 mb-1 font-medium">You said:</p>
                <p className="text-gray-800">
                  {transcript}
                  {interimTranscript && <span className="text-gray-400 italic"> {interimTranscript}</span>}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Card */}
        {feedback && (
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <CardContent className="p-6 space-y-5">
              
              {/* Overall Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                  feedback.overall >= 80 ? 'bg-emerald-100' :
                  feedback.overall >= 60 ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  <span className={`text-4xl font-black ${
                    feedback.overall >= 80 ? 'text-emerald-600' :
                    feedback.overall >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {feedback.overall}%
                  </span>
                </div>
                <p className="mt-3 font-semibold text-gray-800">{feedback.message}</p>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Pronunciation', value: feedback.pronunciation, color: 'blue' },
                  { label: 'Fluency', value: feedback.fluency, color: 'purple' },
                  { label: 'Completeness', value: feedback.completeness, color: 'emerald' },
                ].map((item) => (
                  <div key={item.label} className={`bg-${item.color}-50 rounded-xl p-3 text-center border border-${item.color}-100`}>
                    <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}%</p>
                    <p className={`text-xs text-${item.color}-500 mt-1`}>{item.label}</p>
                  </div>
                ))}
              </div>

              {/* WPM */}
              <div className={`p-4 rounded-xl ${
                feedback.wpm < activeTargetWpm * 0.7 ? 'bg-red-50 border border-red-200' :
                feedback.wpm < activeTargetWpm * 0.9 ? 'bg-amber-50 border border-amber-200' :
                'bg-emerald-50 border border-emerald-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Speaking Speed</span>
                  <span className="font-mono font-bold">{feedback.wpm} / {activeTargetWpm} WPM</span>
                </div>
                <Progress value={Math.min(100, (feedback.wpm / (activeTargetWpm * 1.5)) * 100)} className="mt-2 h-2" />
                <p className="text-xs mt-2 text-gray-600">
                  {feedback.wpm < activeTargetWpm * 0.7 ? '🔴 Too slow - speak a bit faster' :
                   feedback.wpm < activeTargetWpm * 0.9 ? '🟡 Slightly slow - increase pace' :
                   feedback.wpm <= activeTargetWpm * 1.1 ? '🟢 Perfect pace!' :
                   '🔵 A bit fast - slow down slightly'}
                </p>
              </div>

              {/* Missed Words */}
              {feedback.missedWords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Words to practice:</p>
                  <div className="flex flex-wrap gap-2">
                    {feedback.missedWords.slice(0, 8).map((word, i) => (
                      <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Tips:</p>
                {feedback.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button onClick={playPrompt} variant="outline" className="flex-1 rounded-xl">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen Again
                </Button>
                <Button onClick={startListening} className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                  <Mic className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Recent Practice</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.slice(-8).reverse().map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.question}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.practicedAt).toLocaleDateString()} • {new Date(item.practicedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Badge className={`flex-shrink-0 ${item.score >= 80 ? 'bg-emerald-100 text-emerald-700' : item.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {item.score}%
                      </Badge>
                    </div>
                    {item.recordedAnswer && (
                      <p className="text-xs text-gray-500 mt-2 italic">You said: "{item.recordedAnswer}"</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoicePracticePage;
