import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { testDB, testAttemptDB, gamificationDB, notificationDB } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Trophy,
  Target,
  RotateCcw,
  Home,
} from 'lucide-react';
import type { Test } from '@/types';

const TestAttemptPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { testId } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    percentage: number;
    correctAnswers: number;
    isPassed: boolean;
  } | null>(null);

  useEffect(() => {
    if (testId) {
      const testData = testDB.getById(testId);
      if (testData) {
        setTest(testData);
        setTimeLeft(testData.duration * 60);
        setAnswers(new Array(testData.questions.length).fill(-1));
      }
    }
  }, [testId]);

  useEffect(() => {
    if (!isStarted || isCompleted || !test) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isCompleted, test]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const submitTest = useCallback(() => {
    if (!test || !user) return;

    let correctCount = 0;
    let totalScore = 0;

    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
        totalScore += q.marks;
      }
    });

    const percentage = Math.round((totalScore / test.totalMarks) * 100);
    const isPassed = percentage >= test.passingMarks;

    const attempt = {
      id: `attempt_${Date.now()}`,
      testId: test.id,
      studentId: user.id,
      answers,
      score: totalScore,
      totalMarks: test.totalMarks,
      percentage,
      timeTaken: test.duration * 60 - timeLeft,
      completedAt: new Date(),
      isPassed,
    };

    testAttemptDB.create(attempt);

    // Update gamification
    gamificationDB.addXP(user.id, isPassed ? 100 : 50);

    // Check for badges
    const attempts = testAttemptDB.getByStudent(user.id);
    if (attempts.length === 1) {
      gamificationDB.addBadge(user.id, {
        id: 'first-test',
        name: 'First Step',
        description: 'Complete your first test',
        icon: '🎯',
        rarity: 'common',
        unlockedAt: new Date(),
      });
    }

    if (percentage === 100) {
      gamificationDB.addBadge(user.id, {
        id: 'perfect-score',
        name: 'Perfectionist',
        description: 'Score 100% on any test',
        icon: '💯',
        rarity: 'epic',
        unlockedAt: new Date(),
      });
    }

    // Add notification
    notificationDB.create({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: isPassed ? 'Test Passed!' : 'Test Completed',
      message: `You scored ${percentage}% on ${test.title}`,
      type: 'achievement',
      read: false,
      createdAt: new Date(),
    });

    setResult({
      score: totalScore,
      percentage,
      correctAnswers: correctCount,
      isPassed,
    });
    setIsCompleted(true);

    if (isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [test, user, answers, timeLeft]);

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
            <p className="text-gray-500 mb-6">{test.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold">{test.duration}</p>
                <p className="text-xs text-gray-500">Minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold">{test.questions.length}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-lg font-bold">{test.totalMarks}</p>
                <p className="text-xs text-gray-500">Marks</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-blue-800 mb-2">Instructions:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You have {test.duration} minutes to complete</li>
                <li>• Each question has 4 options</li>
                <li>• You need {test.passingMarks}% to pass</li>
                <li>• Timer cannot be paused</li>
              </ul>
            </div>

            <Button onClick={() => setIsStarted(true)} className="w-full">
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                result.isPassed ? 'bg-green-100' : 'bg-orange-100'
              }`}
            >
              {result.isPassed ? (
                <Trophy className="w-12 h-12 text-green-500" />
              ) : (
                <AlertCircle className="w-12 h-12 text-orange-500" />
              )}
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">
              {result.isPassed ? 'Congratulations!' : 'Test Completed'}
            </h1>
            <p className="text-gray-500 mb-6">
              {result.isPassed
                ? 'You passed the test!'
                : 'Keep practicing to improve your score'}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {result.correctAnswers}/{test.questions.length}
                  </p>
                  <p className="text-sm text-gray-500">Correct</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Marks</span>
                  <span className="font-medium">
                    {result.score}/{test.totalMarks}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Time Taken</span>
                  <span className="font-medium">
                    {formatTime(test.duration * 60 - timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/student/tests')} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== -1).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="font-medium">{test.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">
              Question {currentQuestion + 1} of {test.questions.length}
            </span>
            <span className="text-gray-500">
              {answeredCount} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-6">
                  {currentQuestion + 1}. {question.question}
                </h2>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        answers[currentQuestion] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                            answers[currentQuestion] === index
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestion === index
                    ? 'bg-blue-500 text-white'
                    : answers[index] !== -1
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion < test.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(test.questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submitTest}
              disabled={answeredCount < test.questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestAttemptPage;
