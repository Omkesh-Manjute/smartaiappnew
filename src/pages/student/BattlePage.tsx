import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { battleDB, subjectDB, gamificationDB, userDB } from '@/services/supabaseDB';
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
} from 'lucide-react';
import type { Battle, Subject, TestQuestion } from '@/types';

const BattlePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    loadData();
    const interval = setInterval(loadWaitingBattles, 5000); // Refresh every 5 seconds
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

  const createBattle = async (subjectId: string) => {
    if (!user) return;

    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    // Generate random questions from subject
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

    const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);

    const battle: Battle = {
      id: `battle_${Date.now()}`,
      subjectId,
      player1Id: user.id,
      player1Score: 0,
      player2Score: 0,
      player1Answers: [],
      player2Answers: [],
      questions: shuffled,
      status: 'waiting',
      createdAt: new Date(),
    };

    await battleDB.create(battle);
    setActiveBattle(battle);
    toast.success('Battle created! Waiting for opponent...');
  };

  const joinBattle = async (battle: Battle) => {
    if (!user) return;

    // Get opponent name
    const opponent = await userDB.getById(battle.player1Id);
    if (opponent) {
      setOpponentName(opponent.name);
    }

    const updated = await battleDB.update(battle.id, {
      player2Id: user.id,
      status: 'in_progress',
      startedAt: new Date(),
    });

    if (updated) {
      setActiveBattle(updated);
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

    // Calculate score immediately
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

    const isPlayer1 = activeBattle.player1Id === user.id;
    const updates: Partial<Battle> = isPlayer1
      ? { player1Score: score, player1Answers: finalAnswers }
      : { player2Score: score, player2Answers: finalAnswers };

    const updated = await battleDB.update(activeBattle.id, updates);

    if (updated) {
      setActiveBattle(updated);

      // Simulate opponent score if not present
      const oppScore = isPlayer1
        ? updated.player2Score || Math.floor(Math.random() * 30) + 20
        : updated.player1Score || Math.floor(Math.random() * 30) + 20;
      
      setOpponentScore(oppScore);

      let result: 'win' | 'lose' | 'draw';
      if (score > oppScore) result = 'win';
      else if (score < oppScore) result = 'lose';
      else result = 'draw';

      setBattleResult(result);

      if (result === 'win') {
        await gamificationDB.addXP(user.id, 150);
        await gamificationDB.addBadge(user.id, {
          id: 'battle-winner',
          name: 'Battle Winner',
          description: 'Win your first battle',
          icon: '⚔️',
          rarity: 'rare',
          unlockedAt: new Date(),
        });
        confetti({ particleCount: 100, spread: 70 });
        toast.success('You won! +150 XP earned!');
      } else if (result === 'lose') {
        toast.info('You lost! Better luck next time!');
      } else {
        toast.info('It\'s a draw!');
      }
    }
  };

  const formatTime = (seconds: number) => {
    return `${seconds.toString().padStart(2, '0')}s`;
  };

  // Scoreboard Component
  const Scoreboard = () => {
    if (!activeBattle || !user) return null;
    
    return (
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
            <div className={`px-4 py-2 rounded-full font-bold ${
              timeLeft < 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <Timer className="w-4 h-4 inline mr-1" />
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="font-medium text-sm">{opponentName}</p>
              <p className="text-2xl font-bold text-gray-600">{opponentScore}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
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
    );
  };

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
              <Button variant="outline" onClick={() => setActiveBattle(null)} className="flex-1">
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

  if (activeBattle?.status === 'in_progress' && battleResult === null) {
    const question = activeBattle.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-blue-500" />
                <span className="font-bold">Battle Mode</span>
              </div>
              <Badge variant="outline" className="text-blue-600">
                <Target className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Scoreboard />

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

  if (battleResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                battleResult === 'win'
                  ? 'bg-green-100'
                  : battleResult === 'lose'
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
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
            <p className="text-gray-500 mb-6">
              {battleResult === 'win'
                ? 'You earned 150 XP!'
                : battleResult === 'lose'
                ? 'Better luck next time!'
                : 'Close match!'}
            </p>

            {/* Final Scoreboard */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">You</p>
                  <p className={`text-3xl font-bold ${battleResult === 'win' ? 'text-green-600' : 'text-blue-600'}`}>
                    {myScore}
                  </p>
                </div>
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">{opponentName}</p>
                  <p className="text-3xl font-bold text-gray-600">{opponentScore}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="flex-1">
                Dashboard
              </Button>
              <Button onClick={() => { setActiveBattle(null); setBattleResult(null); }} className="flex-1">
                <Swords className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Create Battle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 mb-4">Select a subject to create a battle:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => createBattle(subject.id)}
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
                        <div
                          key={battle.id}
                          className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50"
                        >
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
          </div>

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
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Create or join a battle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Answer 5 questions as fast as you can</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
                    <span>15 seconds per question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Highest score wins 150 XP!</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-xs text-gray-500">Battles Won</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-xs text-gray-500">Total Battles</p>
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
