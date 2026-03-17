import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationDB, voicePracticeDB } from '@/services/supabaseDB';
import { getVoicePracticeFeedback } from '@/services/geminiAPI';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Mic,
  MicOff,
  Square,
  Volume2,
  RefreshCw,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Type,
  BookText,
  AudioLines,
  Sparkles,
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

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: Array<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

const PROMPTS: Record<PracticeMode, PromptItem[]> = {
  word: [
    { id: 'w1', mode: 'word', text: 'comfortable', hint: 'Say clearly: com-for-ta-ble', targetWpm: 50 },
    { id: 'w2', mode: 'word', text: 'entrepreneur', hint: 'Break into parts: on-truh-pruh-nur', targetWpm: 50 },
    { id: 'w3', mode: 'word', text: 'responsibility', hint: 'Speak each syllable slowly', targetWpm: 50 },
    { id: 'w4', mode: 'word', text: 'opportunity', hint: 'Stress: op-por-TU-ni-ty', targetWpm: 50 },
    { id: 'w5', mode: 'word', text: 'pronunciation', hint: 'Focus on clear vowel sounds', targetWpm: 50 },
    { id: 'w6', mode: 'word', text: 'communication', hint: 'Stress: com-mu-ni-CA-tion', targetWpm: 50 },
  ],
  sentence: [
    { id: 's1', mode: 'sentence', text: 'I am improving my English speaking skills every day.', hint: 'Keep a steady pace and clear endings.', targetWpm: 95 },
    { id: 's2', mode: 'sentence', text: 'Practice makes progress, so I speak confidently in class.', hint: 'Emphasize confidence and pauses.', targetWpm: 95 },
    { id: 's3', mode: 'sentence', text: 'Could you please explain this concept in a simple way?', hint: 'Use polite tone and natural rhythm.', targetWpm: 95 },
    { id: 's4', mode: 'sentence', text: 'Technology helps students learn faster and smarter.', hint: 'Don’t rush the final words.', targetWpm: 95 },
    { id: 's5', mode: 'sentence', text: 'My goal is to speak fluently in interviews and presentations.', hint: 'Stress keywords: goal, fluently, interviews.', targetWpm: 95 },
  ],
  paragraph: [
    {
      id: 'p1',
      mode: 'paragraph',
      text: 'Good communication is an essential life skill. When we speak clearly, people understand our ideas better. Regular practice, active listening, and confidence can improve pronunciation and fluency over time.',
      hint: 'Pause naturally after each sentence.',
      targetWpm: 120,
    },
    {
      id: 'p2',
      mode: 'paragraph',
      text: 'Learning English becomes easier when you practice daily. You can read short articles aloud, record your voice, and compare your speech with native pronunciation. Small improvements each day lead to strong long-term results.',
      hint: 'Maintain a consistent speaking speed.',
      targetWpm: 120,
    },
    {
      id: 'p3',
      mode: 'paragraph',
      text: 'During public speaking, your voice should be clear, calm, and expressive. Use pauses to separate ideas and maintain eye contact to connect with your audience. A confident voice creates a strong and lasting impression.',
      hint: 'Avoid very fast speaking in the middle sentence.',
      targetWpm: 120,
    },
  ],
};

const modeMeta: Record<PracticeMode, { label: string; icon: typeof Type }> = {
  word: { label: 'Word Drill', icon: Type },
  sentence: { label: 'Sentence Drill', icon: AudioLines },
  paragraph: { label: 'Paragraph Drill', icon: BookText },
};

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
};

const pickRandomPrompt = (mode: PracticeMode, previousId?: string): PromptItem => {
  const pool = PROMPTS[mode];
  if (pool.length === 1) return pool[0];
  const filtered = pool.filter((item) => item.id !== previousId);
  return filtered[Math.floor(Math.random() * filtered.length)];
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
  expectedWords.forEach((word) => {
    expectedCounts.set(word, (expectedCounts.get(word) ?? 0) + 1);
  });

  let matched = 0;
  spokenWords.forEach((word) => {
    const count = expectedCounts.get(word) ?? 0;
    if (count > 0) {
      matched += 1;
      expectedCounts.set(word, count - 1);
    }
  });

  const missedWords: string[] = [];
  expectedCounts.forEach((count, word) => {
    for (let i = 0; i < count; i++) missedWords.push(word);
  });

  const spokenCounts = new Map<string, number>();
  spokenWords.forEach((word) => {
    spokenCounts.set(word, (spokenCounts.get(word) ?? 0) + 1);
  });
  expectedWords.forEach((word) => {
    const count = spokenCounts.get(word) ?? 0;
    if (count > 0) spokenCounts.set(word, count - 1);
  });
  const extraWords: string[] = [];
  spokenCounts.forEach((count, word) => {
    for (let i = 0; i < count; i++) extraWords.push(word);
  });

  const completeness = expectedWords.length
    ? Math.round((matched / expectedWords.length) * 100)
    : 0;

  const safeDuration = Math.max(durationSeconds, 1);
  const wpm = Math.round((spokenWords.length / safeDuration) * 60);
  const fluencyPenalty = Math.min(100, Math.round(Math.abs(wpm - targetWpm) * 1.2));
  const fluency = Math.max(0, 100 - fluencyPenalty);

  const modeWeight = mode === 'word' ? 0.55 : mode === 'sentence' ? 0.5 : 0.45;
  const overall = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        pronunciation * modeWeight +
        completeness * 0.35 +
        fluency * (1 - modeWeight - 0.35)
      )
    )
  );

  const tips: string[] = [];
  if (pronunciation < 75) tips.push('Speak slower and exaggerate vowel sounds.');
  if (completeness < 80) tips.push('Try to include all words from the prompt.');
  if (fluency < 70) tips.push(`Aim for a natural pace near ${targetWpm} WPM.`);
  if (missedWords.length > 0) tips.push(`Repeat missed words: ${missedWords.slice(0, 5).join(', ')}.`);
  if (tips.length === 0) tips.push('Excellent delivery. Now try the next challenge.');

  const message =
    overall >= 90
      ? 'Outstanding pronunciation and fluency!'
      : overall >= 75
        ? 'Great attempt. You are improving well.'
        : overall >= 60
          ? 'Good effort. Focus on clarity and full sentence coverage.'
          : 'Keep practicing. Slow down and pronounce each word clearly.';

  return {
    overall,
    pronunciation,
    completeness,
    fluency,
    wpm,
    message,
    tips,
    missedWords,
    extraWords,
  };
};

const VoicePracticePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { speak, stop: stopSpeech, supported: ttsSupported } = useTextToSpeech();

  const [mode, setMode] = useState<PracticeMode>('word');
  const [currentPrompt, setCurrentPrompt] = useState<PromptItem>(() => pickRandomPrompt('word'));
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);

  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [history, setHistory] = useState<PracticeRecord[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const interimRef = useRef('');
  const pendingEvaluationRef = useRef(false);
  const sessionStartRef = useRef<number | null>(null);
  const hadSpeechRef = useRef(false);
  const evaluationTimeoutRef = useRef<number | null>(null);

  const activePromptText = useMemo(() => {
    const text = customText.trim();
    return useCustomText && text ? text : currentPrompt.text;
  }, [customText, useCustomText, currentPrompt.text]);

  const activeTargetWpm = useMemo(() => {
    if (useCustomText && customText.trim()) {
      return mode === 'word' ? 55 : mode === 'sentence' ? 95 : 120;
    }
    return currentPrompt.targetWpm;
  }, [useCustomText, customText, currentPrompt.targetWpm, mode]);

  const stats = useMemo(() => {
    const total = history.length;
    const avg = total
      ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / total)
      : 0;
    const best = total ? Math.max(...history.map((item) => item.score)) : 0;
    return { total, avg, best };
  }, [history]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const records = await voicePracticeDB.getByStudent(user.id);
        const normalized: PracticeRecord[] = records.map((item: any) => ({
          ...item,
          practicedAt: new Date(item.practicedAt),
        }));
        setHistory(normalized);
      } catch (error) {
        console.error('Failed to load voice practice history:', error);
      }
    })();
  }, [user]);

  useEffect(() => {
    const RecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setIsSupported(false);
      toast.error('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += `${text} `;
        } else {
          interimChunk += `${text} `;
        }
      }

      if (finalChunk.trim()) {
        hadSpeechRef.current = true;
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalChunk}`.trim();
        setTranscript(finalTranscriptRef.current);
      }

      interimRef.current = interimChunk.trim();
      if (interimRef.current) {
        hadSpeechRef.current = true;
      }
      setInterimTranscript(interimRef.current);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted') {
        toast.error(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!pendingEvaluationRef.current) return;

      pendingEvaluationRef.current = false;
      if (evaluationTimeoutRef.current) {
        window.clearTimeout(evaluationTimeoutRef.current);
      }
      evaluationTimeoutRef.current = window.setTimeout(() => {
        const spoken = `${finalTranscriptRef.current} ${interimRef.current}`.trim();
        if (!spoken) {
          toast.error(
            hadSpeechRef.current
              ? 'Speech capture was unclear. Please speak a bit louder and retry.'
              : 'No speech detected. Please allow microphone access and try again.'
          );
          return;
        }
        void evaluateAttempt(spoken);
      }, 300);
    };

    recognitionRef.current = recognition;

    return () => {
      if (evaluationTimeoutRef.current) {
        window.clearTimeout(evaluationTimeoutRef.current);
      }
      recognition.abort();
      stopSpeech();
    };
  }, [stopSpeech]);

  const resetAttemptState = () => {
    if (evaluationTimeoutRef.current) {
      window.clearTimeout(evaluationTimeoutRef.current);
      evaluationTimeoutRef.current = null;
    }
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    finalTranscriptRef.current = '';
    interimRef.current = '';
    pendingEvaluationRef.current = false;
    sessionStartRef.current = null;
    hadSpeechRef.current = false;
  };

  const changeMode = (nextMode: PracticeMode) => {
    setMode(nextMode);
    setCurrentPrompt(pickRandomPrompt(nextMode));
    setUseCustomText(false);
    setCustomText('');
    resetAttemptState();
    stopSpeech();
  };

  const nextPrompt = () => {
    setCurrentPrompt((prev) => pickRandomPrompt(mode, prev.id));
    resetAttemptState();
    stopSpeech();
  };

  const playPrompt = () => {
    if (!ttsSupported) {
      toast.error('Text-to-speech is not supported in this browser');
      return;
    }
    const isHindi = /[\u0900-\u097F]/.test(activePromptText);
    speak(activePromptText, isHindi ? 'hi' : 'en');
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }
    if (!activePromptText.trim()) {
      toast.error('Please enter prompt text first');
      return;
    }

    resetAttemptState();
    sessionStartRef.current = Date.now();

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Could not start microphone. Please allow mic access and retry.');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    pendingEvaluationRef.current = true;
    recognitionRef.current.stop();
  };

  const evaluateAttempt = async (spokenText: string) => {
    if (!user) return;

    const durationSeconds = sessionStartRef.current
      ? (Date.now() - sessionStartRef.current) / 1000
      : 1;

    const result = evaluateSpeech(
      activePromptText,
      spokenText,
      mode,
      durationSeconds,
      activeTargetWpm
    );

    // Get AI feedback in background
    getVoicePracticeFeedback(activePromptText, spokenText, {
      pronunciation: result.pronunciation,
      fluency: result.fluency,
      clarity: result.completeness,
      wpm: result.wpm,
      targetWpm: activeTargetWpm,
    }).then((aiFeedback) => {
      setFeedback((prev) => prev ? {
        ...prev,
        aiTips: aiFeedback.tips,
        syllableHints: aiFeedback.syllableHints,
        aiComment: aiFeedback.overallComment,
      } : prev);
    }).catch(() => { /* AI feedback is optional */ });

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

    try {
      await voicePracticeDB.create(record);
    } catch (error) {
      console.error('Failed to save voice practice record:', error);
    }

    const xp = result.overall >= 85 ? 40 : result.overall >= 70 ? 25 : 15;
    try {
      await gamificationDB.addXP(user.id, xp);
      toast.success(`Practice complete. +${xp} XP`);
    } catch {
      toast.success('Practice complete');
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <MicOff className="w-14 h-14 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Voice Practice Not Supported</h2>
          <p className="text-gray-500 max-w-md">
            Your browser does not support speech recognition. Use latest Chrome or Edge for this feature.
          </p>
          <Button onClick={() => navigate('/student/dashboard')} className="mt-5">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Voice Practice Lab</h1>
                <p className="text-xs text-gray-500">Pronunciation, fluency, and confidence trainer</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              {modeMeta[mode].label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold">{stats.avg}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="text-2xl font-bold">{stats.best}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose Practice Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['word', 'sentence', 'paragraph'] as PracticeMode[]).map((item) => {
                const Icon = modeMeta[item].icon;
                const active = mode === item;
                return (
                  <button
                    key={item}
                    onClick={() => changeMode(item)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${active
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold">{modeMeta[item].label}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {item === 'word'
                        ? 'Focus on single-word clarity.'
                        : item === 'sentence'
                          ? 'Practice rhythm and sentence pacing.'
                          : 'Train long-form fluency and breath control.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    Practice Prompt
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={nextPrompt}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      New Prompt
                    </Button>
                    <Button variant="outline" size="sm" onClick={playPrompt}>
                      <Volume2 className="w-4 h-4 mr-1" />
                      Listen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">{activePromptText}</p>
                <p className="text-sm text-gray-500">{currentPrompt.hint}</p>

                <div className="flex items-center gap-2">
                  <Button
                    variant={useCustomText ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setUseCustomText((prev) => !prev);
                      resetAttemptState();
                    }}
                  >
                    {useCustomText ? 'Using Custom Text' : 'Use Custom Text'}
                  </Button>
                  <span className="text-xs text-gray-500">Target pace: {activeTargetWpm} WPM</span>
                </div>

                {useCustomText && (
                  <Input
                    placeholder="Type your own word/sentence/paragraph prompt..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record Your Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {!isListening ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startListening}
                      className="w-24 h-24 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30"
                    >
                      <Mic className="w-10 h-10 text-white" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopListening}
                      className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30"
                    >
                      <Square className="w-8 h-8 text-white" />
                    </motion.button>
                  )}
                  <p className={`mt-3 font-medium ${isListening ? 'text-rose-600' : 'text-gray-600'}`}>
                    {isListening ? 'Recording... tap to stop' : 'Tap to start speaking'}
                  </p>
                </div>

                {(transcript || interimTranscript) && (
                  <div className="mt-5 p-4 rounded-xl bg-gray-50 border">
                    <p className="text-xs text-gray-500 mb-1">Transcript</p>
                    <p className="leading-relaxed">
                      {transcript}
                      {interimTranscript && <span className="text-gray-400"> {interimTranscript}</span>}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Pronunciation Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Overall Score */}
                  <div className="text-center">
                    <p className="text-5xl font-bold text-emerald-600">{feedback.overall}%</p>
                    <p className="text-sm text-gray-600 mt-1">{feedback.aiComment || feedback.message}</p>
                  </div>

                  {/* Score Cards Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <p className="text-2xl font-bold text-blue-600">{feedback.pronunciation}%</p>
                      <p className="text-xs text-blue-500 mt-1">Pronunciation</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                      <p className="text-2xl font-bold text-purple-600">{feedback.fluency}%</p>
                      <p className="text-xs text-purple-500 mt-1">Fluency</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                      <p className="text-2xl font-bold text-emerald-600">{feedback.completeness}%</p>
                      <p className="text-xs text-emerald-500 mt-1">Clarity</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pronunciation</span>
                        <span>{feedback.pronunciation}%</span>
                      </div>
                      <Progress value={feedback.pronunciation} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fluency</span>
                        <span>{feedback.fluency}%</span>
                      </div>
                      <Progress value={feedback.fluency} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Clarity / Completeness</span>
                        <span>{feedback.completeness}%</span>
                      </div>
                      <Progress value={feedback.completeness} />
                    </div>
                  </div>

                  {/* WPM Gauge */}
                  <div className={`p-4 rounded-xl border-2 ${feedback.wpm < activeTargetWpm * 0.7
                      ? 'bg-red-50 border-red-200'
                      : feedback.wpm < activeTargetWpm * 0.9
                        ? 'bg-yellow-50 border-yellow-200'
                        : feedback.wpm <= activeTargetWpm * 1.1
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Speaking Speed</span>
                      <span className="text-sm font-mono">{feedback.wpm} / {activeTargetWpm} WPM</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${feedback.wpm < activeTargetWpm * 0.7
                            ? 'bg-red-500'
                            : feedback.wpm < activeTargetWpm * 0.9
                              ? 'bg-yellow-500'
                              : feedback.wpm <= activeTargetWpm * 1.1
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                          }`}
                        style={{ width: `${Math.min(100, (feedback.wpm / (activeTargetWpm * 1.5)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs mt-2 text-gray-600">
                      {feedback.wpm < activeTargetWpm * 0.7
                        ? '🔴 Too slow — try speaking a bit faster'
                        : feedback.wpm < activeTargetWpm * 0.9
                          ? '🟡 Slightly slow — increase your pace a little'
                          : feedback.wpm <= activeTargetWpm * 1.1
                            ? '🟢 Great pace! Right on target'
                            : '🔵 A bit fast — try to slow down slightly'}
                    </p>
                  </div>

                  {/* Syllable Hints from AI */}
                  {feedback.syllableHints && (
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-sm font-medium text-purple-700 mb-1">🗣️ Correct Pronunciation</p>
                      <p className="text-lg font-mono text-purple-800">{feedback.syllableHints}</p>
                    </div>
                  )}

                  {/* Voice Comparison */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-700 mb-3">🎧 Voice Comparison</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playPrompt}
                        className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Listen Correct
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { resetAttemptState(); startListening(); }}
                        className="flex-1 border-cyan-300 text-cyan-700 hover:bg-cyan-100"
                      >
                        <Mic className="w-4 h-4 mr-1" />
                        Record Again
                      </Button>
                    </div>
                  </div>

                  {feedback.missedWords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Missed words</p>
                      <div className="flex flex-wrap gap-2">
                        {feedback.missedWords.slice(0, 12).map((word, index) => (
                          <Badge key={`${word}_${index}`} className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI-Powered Tips */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">💡 {feedback.aiTips ? 'AI Feedback' : 'Practice Tips'}</p>
                    {(feedback.aiTips || feedback.tips).map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        {feedback.overall >= 75 ? (
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                        )}
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attempts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.length === 0 && (
                  <p className="text-sm text-gray-500">No attempts yet. Start your first practice.</p>
                )}
                {history
                  .slice()
                  .sort((a, b) => b.practicedAt.getTime() - a.practicedAt.getTime())
                  .slice(0, 8)
                  .map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium line-clamp-2">{item.question}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{item.practicedAt.toLocaleDateString()}</span>
                        <Badge
                          className={`${item.score >= 80
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : item.score >= 60
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                          {item.score}%
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoicePracticePage;
