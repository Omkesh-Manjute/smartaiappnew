import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { battleDB, subjectDB, userDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Swords,
  Users,
  Trophy,
  Zap,
  Target,
  ChevronLeft,
  Play,
  User,
  Medal,
  Timer,
  BarChart3,
  Bot,
  Dumbbell,
  Shield,
  Flame,
  Star,
} from 'lucide-react';
import type { Battle, Subject, TestQuestion } from '@/types';

type BattleTab = 'online' | 'ai' | 'practice';
type AIDifficulty = 'easy' | 'medium' | 'hard' | 'pro';

const AI_ACCURACY: Record<AIDifficulty, number> = {
  easy: 0.4,
  medium: 0.6,
  hard: 0.8,
  pro: 0.95,
};

const DIFFICULTY_CONFIG: Record<AIDifficulty, { label: string; color: string; icon: React.ElementType; description: string }> = {
  easy: { label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300', icon: Shield, description: 'AI gets ~40% right' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Target, description: 'AI gets ~60% right' },
  hard: { label: 'Hard', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Flame, description: 'AI gets ~80% right' },
  pro: { label: 'Pro', color: 'bg-red-100 text-red-700 border-red-300', icon: Star, description: 'AI gets ~95% right' },
};

const BattlePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkAchievements } = useGamification();
  const [activeTab, setActiveTab] = useState<BattleTab>('ai');
  const [waitingBattles, setWaitingBattles] = useState<Battle[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [opponentName, setOpponentName] = useState<string>('Opponent');
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const [xpEarned, setXpEarned] = useState(0);
  const [battleType, setBattleType] = useState<BattleTab>('online');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadWaitingBattles, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeBattle?.status === 'in_progress') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer(-1);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeBattle, currentQuestion]);

  const loadData = async () => {
    const allSubjects = await subjectDB.getAll();
    setSubjects(allSubjects);
    loadWaitingBattles();
  };

  const loadWaitingBattles = async () => {
    if (!user) return;
    const battles = await battleDB.getWaitingBattles();
    setWaitingBattles(battles.filter((b) => b.player1Id !== user.id));
  };

  const generateQuestions = (subjectId: string): TestQuestion[] => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return [];

    const allQuestions: TestQuestion[] = [];
    subject.chapters.forEach((ch) => {
      ch.mcqs.forEach((mcq) => {
        allQuestions.push({
          id: mcq.id,
          question: mcq.question,
          options: mcq.options,
          correctAnswer: mcq.correctAnswer,
          marks: 10,
          difficulty: mcq.difficulty,
        });
      });
    });

    return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
  };

  const createOnlineBattle = async (subjectId: string) => {
    if (!user) return;
    const questions = generateQuestions(subjectId);
    if (questions.length === 0) {
      toast.error('No questions available for this subject');
      return;
    }

    const battle: Battle = {
      id: `battle_${Date.now()}`,
      subjectId,
      player1Id: user.id,
      player1Score: 0,
      player2Score: 0,
      player1Answers: [],
      player2Answers: [],
      questions,
      status: 'waiting',
      createdAt: new Date(),
      battleType: 'online',
    };

    await battleDB.create(battle);
    setActiveBattle(battle);
    setBattleType('online');
    toast.success('Battle created! Waiting for opponent...');
  };

  const startAIBattle = async (subjectId: string) => {
    if (!user) return;
    const questions = generateQuestions(subjectId);
    if (questions.length === 0) {
      toast.error('No questions available for this subject');
      return;
    }

    const battle: Battle = {
      id: `ai_battle_${Date.now()}`,
      subjectId,
      player1Id: user.id,
      player2Id: 'AI_OPPONENT',
      player1Score: 0,
      player2Score: 0,
      player1Answers: [],
      player2Answers: [],
      questions,
      status: 'in_progress',
      createdAt: new Date(),
      startedAt: new Date(),
      battleType: 'ai',
      difficulty: selectedDifficulty,
    };

    setActiveBattle(battle);
    setBattleType('ai');
    setOpponentName(`AI (${DIFFICULTY_CONFIG[selectedDifficulty].label})`);
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestion(0);
    setTimeLeft(15);
    setMyScore(0);
    setOpponentScore(0);
  };

  const startPracticeBattle = async (subjectId: string) => {
    if (!user) return;
    const questions = generateQuestions(subjectId);
    if (questions.length === 0) {
      toast.error('No questions available for this subject');
      return;
    }

    const battle: Battle = {
      id: `practice_${Date.now()}`,
      subjectId,
      player1Id: user.id,
      player1Score: 0,
      player2Score: 0,
      player1Answers: [],
      player2Answers: [],
      questions,
      status: 'in_progress',
      createdAt: new Date(),
      startedAt: new Date(),
      battleType: 'practice',
    };

    setActiveBattle(battle);
    setBattleType('practice');
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestion(0);
    setTimeLeft(15);
    setMyScore(0);
    setOpponentScore(0);
  };

  const joinBattle = async (battle: Battle) => {
    if (!user) return;
    const opponent = await userDB.getById(battle.player1Id);
    if (opponent) setOpponentName(opponent.name);

    const updated = await battleDB.update(battle.id, {
      player2Id: user.id,
      status: 'in_progress',
      startedAt: new Date(),
    });

    if (updated) {
      setActiveBattle(updated);
      setBattleType('online');
      setAnswers(new Array(updated.questions.length).fill(-1));
      setCurrentQuestion(0);
      setTimeLeft(15);
      setMyScore(0);
      setOpponentScore(0);
    }
  };

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!activeBattle) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    let currentScore = 0;
    activeBattle.questions.forEach((q, index) => {
      if (newAnswers[index] === q.correctAnswer) {
        currentScore += 10;
      }
    });
    setMyScore(currentScore);

    if (currentQuestion < activeBattle.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(15);
    } else {
      finishBattle(newAnswers);
    }
  }, [activeBattle, answers, currentQuestion]);

  const finishBattle = async (finalAnswers: number[]) => {
    if (!activeBattle || !user) return;

    let score = 0;
    activeBattle.questions.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        score += 10;
      }
    });

    let oppScore = 0;

    if (battleType === 'ai') {
      // Simulate AI opponent based on difficulty
      const accuracy = AI_ACCURACY[selectedDifficulty];
      activeBattle.questions.forEach(() => {
        if (Math.random() < accuracy) {
          oppScore += 10;
        }
      });
    } else if (battleType === 'practice') {
      oppScore = 0; // No opponent in practice
    } else {
      // Online battle
      const isPlayer1 = activeBattle.player1Id === user.id;
      const updates: Partial<Battle> = isPlayer1
        ? { player1Score: score, player1Answers: finalAnswers }
        : { player2Score: score, player2Answers: finalAnswers };
      await battleDB.update(activeBattle.id, updates);
      oppScore = isPlayer1
        ? activeBattle.player2Score || Math.floor(Math.random() * 30) + 20
        : activeBattle.player1Score || Math.floor(Math.random() * 30) + 20;
    }

    setOpponentScore(oppScore);

    let result: 'win' | 'lose' | 'draw';
    if (battleType === 'practice') {
      result = 'win'; // Practice always "wins"
    } else if (score > oppScore) {
      result = 'win';
    } else if (score < oppScore) {
      result = 'lose';
    } else {
      result = 'draw';
    }

    setBattleResult(result);

    let earnedXp = 0;
    if (result === 'win') {
      earnedXp = battleType === 'practice' ? 20 : 150;
      // Use global gamification context
      checkAchievements('battle', activeBattle);
      confetti({ particleCount: 100, spread: 70 });
      toast.success(`You won! +${earnedXp} XP earned!`);
    } else if (result === 'lose') {
      earnedXp = 30;
      await gamificationDB.addXP(user.id, earnedXp);
      toast.info('You lost! +30 XP for participation');
    } else {
      earnedXp = 50;
      await gamificationDB.addXP(user.id, earnedXp);
      toast.info("It's a draw! +50 XP");
    }
    setXpEarned(earnedXp);
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, '0')}s`;
  };

  const resetBattle = () => {
    setActiveBattle(null);
    setBattleResult(null);
    setMyScore(0);
    setOpponentScore(0);
    setXpEarned(0);
    setAnswers([]);
    setCurrentQuestion(0);
  };

  // ===== RENDER: Waiting Screen =====
  if (activeBattle?.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Swords className="w-16 h-16 text-blue-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Waiting for Opponent...</h2>
            <p className="text-gray-500 mb-6">Share this battle ID with a friend:</p>
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <code className="text-lg font-mono">{activeBattle.id}</code>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetBattle} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(activeBattle.id)} variant="outline">
                Copy ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER: Active Battle =====
  if (activeBattle?.status === 'in_progress' && battleResult === null) {
    const question = activeBattle.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-blue-500" />
                <span className="font-bold">
                  {battleType === 'ai' ? 'AI Battle' : battleType === 'practice' ? 'Practice' : 'Online Battle'}
                </span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                <Target className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Scoreboard */}
          <div className="bg-white rounded-xl border p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">You</p>
                  <p className="text-2xl font-bold text-blue-600">{myScore}</p>
                </div>
              </div>

              <div className="text-center">
                <div className={`px-4 py-2 rounded-full font-bold ${timeLeft < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                  }`}>
                  <Timer className="w-4 h-4 inline mr-1" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              {battleType !== 'practice' && (
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="font-medium text-sm">{opponentName}</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {battleType === 'ai' ? '?' : opponentScore}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {battleType === 'ai' ? (
                      <Bot className="w-5 h-5 text-purple-600" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Question {currentQuestion + 1} of {activeBattle.questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / activeBattle.questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / activeBattle.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-medium mb-6">{question.question}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(index)}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ===== RENDER: Result Screen =====
  if (battleResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${battleResult === 'win' ? 'bg-green-100' : battleResult === 'lose' ? 'bg-red-100' : 'bg-yellow-100'
                }`}
            >
              {battleResult === 'win' ? (
                <Trophy className="w-12 h-12 text-green-500" />
              ) : battleResult === 'lose' ? (
                <Medal className="w-12 h-12 text-red-500" />
              ) : (
                <Target className="w-12 h-12 text-yellow-500" />
              )}
            </motion.div>

            <h2 className="text-3xl font-bold mb-2">
              {battleResult === 'win' ? 'Victory!' : battleResult === 'lose' ? 'Defeat!' : 'Draw!'}
            </h2>

            {/* XP Earned */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full mb-4"
            >
              <Zap className="w-4 h-4" />
              <span className="font-bold">+{xpEarned} XP</span>
            </motion.div>

            {/* Score */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">You</p>
                  <p className={`text-3xl font-bold ${battleResult === 'win' ? 'text-green-600' : 'text-blue-600'}`}>
                    {myScore}
                  </p>
                </div>
                {battleType !== 'practice' && (
                  <>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">{opponentName}</p>
                      <p className="text-3xl font-bold text-gray-600">{opponentScore}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {battleType === 'ai' && `Difficulty: ${DIFFICULTY_CONFIG[selectedDifficulty].label}`}
              {battleType === 'practice' && `Correct: ${myScore / 10} / ${activeBattle?.questions.length || 5}`}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="flex-1">
                Dashboard
              </Button>
              <Button onClick={resetBattle} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                <Swords className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER: Battle Selection =====
  const tabs: { id: BattleTab; label: string; icon: React.ElementType }[] = [
    { id: 'online', label: 'Online Battle', icon: Users },
    { id: 'ai', label: 'AI Battle', icon: Bot },
    { id: 'practice', label: 'Practice', icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Swords className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold">Battle Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* ===== Online Battle Tab ===== */}
            {activeTab === 'online' && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Create Online Battle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 mb-4">Challenge a friend — select a subject:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subjects.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => createOnlineBattle(subject.id)}
                          className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                          <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center text-2xl`}>
                            {subject.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{subject.name}</p>
                            <p className="text-sm text-gray-500">{subject.chapters.length} chapters</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      Join Battle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {waitingBattles.length > 0 ? (
                      <div className="space-y-3">
                        {waitingBattles.map((battle) => {
                          const subject = subjects.find((s) => s.id === battle.subjectId);
                          return (
                            <div key={battle.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">Waiting for opponent</p>
                                  <p className="text-sm text-gray-500">{subject?.name}</p>
                                </div>
                              </div>
                              <Button onClick={() => joinBattle(battle)} size="sm">
                                <Play className="w-4 h-4 mr-1" />
                                Join
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No active battles</p>
                        <p className="text-sm">Create one to get started!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ===== AI Battle Tab ===== */}
            {activeTab === 'ai' && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-purple-500" />
                      Choose Difficulty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {(Object.keys(DIFFICULTY_CONFIG) as AIDifficulty[]).map((diff) => {
                        const config = DIFFICULTY_CONFIG[diff];
                        const Icon = config.icon;
                        return (
                          <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${selectedDifficulty === diff
                              ? `${config.color} border-current shadow-md`
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <p className="font-semibold text-sm">{config.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-blue-500" />
                      Select Subject
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subjects.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => startAIBattle(subject.id)}
                          className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                        >
                          <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center text-2xl`}>
                            {subject.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{subject.name}</p>
                            <p className="text-sm text-gray-500">vs AI ({DIFFICULTY_CONFIG[selectedDifficulty].label})</p>
                          </div>
                          <Bot className="w-5 h-5 ml-auto text-purple-400" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ===== Practice Tab ===== */}
            {activeTab === 'practice' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-green-500" />
                    Practice Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">Solo practice — answer questions to earn XP!</p>
                  <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Correct answer = +10 XP each</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => startPracticeBattle(subject.id)}
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
                      >
                        <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center text-2xl`}>
                          {subject.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{subject.name}</p>
                          <p className="text-sm text-gray-500">{subject.chapters.length} chapters</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>{activeTab === 'ai' ? 'Select difficulty & subject' : activeTab === 'practice' ? 'Select a subject' : 'Create or join a battle'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span>Answer 5 questions as fast as you can</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <span>15 seconds per question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                    <span>
                      {activeTab === 'ai' ? 'Beat the AI to win 150 XP!' : activeTab === 'practice' ? 'Each correct answer = +10 XP' : 'Highest score wins 150 XP!'}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  XP Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <span className="text-sm">🏆 Battle Win</span>
                    <span className="font-bold text-green-600">+150 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <span className="text-sm">🤝 Draw</span>
                    <span className="font-bold text-yellow-600">+50 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm">👍 Participation</span>
                    <span className="font-bold text-blue-600">+30 XP</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <span className="text-sm">📝 Practice (per Q)</span>
                    <span className="font-bold text-purple-600">+10 XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BattlePage;
