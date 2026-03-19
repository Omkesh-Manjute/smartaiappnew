export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';
export type Board = 'CBSE' | 'STATE';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  board?: Board;
  avatar?: string;
  createdAt: Date;
  isPremium?: boolean;
  aiQuestionsToday?: number;
  lastAiResetAt?: Date;
  schoolId?: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  grade: number;
  boards_supported?: Board[];
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string | { [key in Board]?: string };
  description: string;
  order: number;
  content: string | { [key in Board]?: ChapterContent };
  videoUrl?: string;
  mcqs: MCQ[];
  topics?: Topic[];
  isLocked?: boolean;
  isCompleted?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  content: { [key in Board]?: ChapterContent };
}

export interface ChapterContent {
  explanation: string;
  mcq: MCQ[];
  short_questions?: string[];
  extra_questions?: string[];
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Test Types
export interface Test {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  chapterIds: string[];
  questions: TestQuestion[];
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestAttempt {
  id: string;
  testId: string;
  studentId: string;
  answers: number[];
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number; // in seconds
  completedAt: Date;
  isPassed: boolean;
}

// Progress Types
export interface StudentProgress {
  studentId: string;
  subjectId: string;
  chapterId: string;
  completed: boolean;
  mcqScore: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
}

// Group Learning Types
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: Date;
  maxMembers: number;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  message: string;
  sentAt: Date;
}

// Gamification Types
export interface GamificationData {
  studentId: string;
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: Date;
  totalStudyTime: number;
  badges: Badge[];
  unlockedAvatars: string[];
  unlockedThemes: string[];
  currentAvatar: string;
  coins: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export const BADGES: Record<string, Badge> = {
  'first-test': { id: 'first-test', name: 'First Step', description: 'Complete your first test', icon: '🎯', rarity: 'common' },
  'perfect-score': { id: 'perfect-score', name: 'Perfectionist', description: 'Score 100% on any test', icon: '💯', rarity: 'epic' },
  'streak-7': { id: 'streak-7', name: 'Week Warrior', description: '7-day study streak', icon: '🔥', rarity: 'rare' },
  'streak-30': { id: 'streak-30', name: 'Monthly Master', description: '30-day study streak', icon: '📅', rarity: 'legendary' },
  'early-bird': { id: 'early-bird', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', rarity: 'rare' },
  'night-owl': { id: 'night-owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', rarity: 'rare' },
  'subject-expert': { id: 'subject-expert', name: 'Subject Expert', description: 'Complete all chapters in a subject', icon: '📚', rarity: 'epic' },
  'test-champion': { id: 'test-champion', name: 'Test Champion', description: 'Pass 10 tests with 90%+ score', icon: '🏆', rarity: 'legendary' },
  'speed-demon': { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a test in half the time', icon: '⚡', rarity: 'rare' },
  'helper': { id: 'helper', name: 'Helper', description: 'Help 5 classmates in group chat', icon: '🤝', rarity: 'common' },
  'battle-winner': { id: 'battle-winner', name: 'Battle Winner', description: 'Win your first battle', icon: '⚔️', rarity: 'rare' },
  'battle-master': { id: 'battle-master', name: 'Battle Master', description: 'Win 10 battles', icon: '👑', rarity: 'epic' },
  'voice-master': { id: 'voice-master', name: 'Voice Master', description: 'Complete 50 voice practice sessions', icon: '🎙️', rarity: 'epic' },
  'quiz-champion': { id: 'quiz-champion', name: 'Quiz Champion', description: 'Score 100% in 5 quiz sessions', icon: '🧠', rarity: 'legendary' },
  'battle-king': { id: 'battle-king', name: 'Battle King', description: 'Win 20 battles', icon: '🗡️', rarity: 'legendary' },
};

// Battle Types
export interface Battle {
  id: string;
  subjectId: string;
  chapterId?: string;
  player1Id: string;
  player2Id?: string;
  player1Score: number;
  player2Score: number;
  player1Answers: number[];
  player2Answers: number[];
  questions: TestQuestion[];
  status: 'waiting' | 'in_progress' | 'completed';
  winnerId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  battleType?: 'online' | 'ai' | 'practice';
  difficulty?: 'easy' | 'medium' | 'hard' | 'pro';
}

// Study Plan Types
export interface StudyPlan {
  id: string;
  studentId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  dailyGoals: DailyGoal[];
  subjects: string[];
  totalHours: number;
  createdAt: Date;
  isActive: boolean;
}

export interface DailyGoal {
  date: Date;
  tasks: StudyTask[];
  completed: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  chapterId?: string;
  duration: number; // in minutes
  completed: boolean;
  type: 'read' | 'practice' | 'test' | 'review';
}

// Concept Mastery Types
export interface ConceptMastery {
  studentId: string;
  subjectId: string;
  chapterId: string;
  conceptName: string;
  masteryLevel: number; // 0-100
  attempts: number;
  correctAttempts: number;
  lastPracticed: Date;
}

// Voice Practice Types
export interface VoicePractice {
  id: string;
  studentId: string;
  questionId: string;
  question: string;
  recordedAnswer: string;
  score: number;
  feedback: string;
  practicedAt: Date;
}

// AI Tutor Types
export interface TutorMessage {
  id: string;
  studentId: string;
  message: string;
  response: string;
  subjectId?: string;
  chapterId?: string;
  sentAt: Date;
}

// Parent Types
export interface ParentChild {
  parentId: string;
  childId: string;
  addedAt: Date;
}

export interface ParentDashboard {
  parentId: string;
  children: {
    studentId: string;
    name: string;
    avatar: string;
    progress: {
      totalStudyTime: number;
      testsCompleted: number;
      averageScore: number;
      streak: number;
    };
    recentActivity: Activity[];
  }[];
}

export interface Activity {
  id: string;
  type: 'test_completed' | 'chapter_completed' | 'badge_earned' | 'battle_won';
  title: string;
  description: string;
  timestamp: Date;
}

// School Subscription Types
export interface School {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  adminId: string;
  subscription: Subscription;
  teachers: string[];
  students: string[];
  createdAt: Date;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate: Date;
  maxTeachers: number;
  maxStudents: number;
  features: string[];
  price: number;
}

export const SUBSCRIPTION_PLANS = {
  free: { name: 'Free', maxTeachers: 2, maxStudents: 50, price: 0, features: ['Basic Tests', 'Limited Subjects'] },
  basic: { name: 'Basic', maxTeachers: 10, maxStudents: 500, price: 4999, features: ['All Tests', 'All Subjects', 'Basic Analytics'] },
  premium: { name: 'Premium', maxTeachers: 50, maxStudents: 2000, price: 14999, features: ['AI Tutor', 'Voice Practice', 'Advanced Analytics', 'Parent Dashboard'] },
  enterprise: { name: 'Enterprise', maxTeachers: 999999, maxStudents: 999999, price: 49999, features: ['Everything Unlimited', 'Custom Features', 'Priority Support', 'White Label'] },
};

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'reminder' | 'battle' | 'message' | 'system';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Quote Types
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'success' | 'learning' | 'perseverance';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  { id: '1', text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', category: 'motivation' },
  { id: '2', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'success' },
  { id: '3', text: 'The more that you read, the more things you will know.', author: 'Dr. Seuss', category: 'learning' },
  { id: '4', text: 'It always seems impossible until it is done.', author: 'Nelson Mandela', category: 'perseverance' },
  { id: '5', text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela', category: 'learning' },
  { id: '6', text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson', category: 'perseverance' },
  { id: '7', text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', category: 'motivation' },
  { id: '8', text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'motivation' },
  { id: '9', text: 'Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.', author: 'Abigail Adams', category: 'learning' },
  { id: '10', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'success' },
];

// Leaderboard Types
export interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  rank: number;
}

// Homework Types
export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  chapterId: string | null;
  teacherId: string;
  fileUrl: string | null;
  fileName: string | null;
  dueDate: Date;
  maxMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  fileUrl: string | null;
  fileName: string | null;
  answerText: string | null;
  submittedAt: Date;
  marks: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded' | 'late';
}

// Teacher Analytics Types
export interface TeacherAnalytics {
  teacherId: string;
  totalStudents: number;
  totalTests: number;
  totalHomework: number;
  averageScore: number;
  studentPerformance: {
    studentId: string;
    name: string;
    testsTaken: number;
    averageScore: number;
    homeworkSubmitted: number;
    homeworkLate: number;
  }[];
  testPerformance: {
    testId: string;
    testName: string;
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  }[];
}
