import type {
  User, Subject, Test, TestAttempt, StudentProgress,
  StudyGroup, GroupMessage, GamificationData, Battle, StudyPlan,
  ConceptMastery, VoicePractice, TutorMessage, ParentChild,
  School, Notification, Badge
} from '@/types';
import { class5Subjects, class5Tests } from '@/data/class5Data';

const DB_KEYS = {
  USERS: 'smart_learning_users',
  SUBJECTS: 'smart_learning_subjects',
  TESTS: 'smart_learning_tests',
  TEST_ATTEMPTS: 'smart_learning_test_attempts',
  PROGRESS: 'smart_learning_progress',
  STUDY_GROUPS: 'smart_learning_study_groups',
  GROUP_MESSAGES: 'smart_learning_group_messages',
  GAMIFICATION: 'smart_learning_gamification',
  BATTLES: 'smart_learning_battles',
  STUDY_PLANS: 'smart_learning_study_plans',
  CONCEPT_MASTERY: 'smart_learning_concept_mastery',
  VOICE_PRACTICE: 'smart_learning_voice_practice',
  TUTOR_MESSAGES: 'smart_learning_tutor_messages',
  PARENT_CHILDREN: 'smart_learning_parent_children',
  SCHOOLS: 'smart_learning_schools',
  NOTIFICATIONS: 'smart_learning_notifications',
  CURRENT_USER: 'smart_learning_current_user',
  DELETED_SUBJECTS: 'smart_learning_deleted_subjects',
  DELETED_CHAPTERS: 'smart_learning_deleted_chapters',
  IS_SEEDED: 'smart_learning_is_seeded',
};

// Generic CRUD operations
const getAll = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const getById = <T>(key: string, id: string): T | null => {
  const items = getAll<T>(key);
  return items.find((item: any) => item.id === id) || null;
};

const create = <T>(key: string, item: T): T => {
  const items = getAll<T>(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
  return item;
};

const update = <T>(key: string, id: string, updates: Partial<T>): T | null => {
  const items = getAll<T>(key);
  const index = items.findIndex((item: any) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(key, JSON.stringify(items));
  return items[index];
};

const remove = <T>(key: string, id: string): boolean => {
  const items = getAll<T>(key);
  const filtered = items.filter((item: any) => item.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
};

// User Operations
export const userDB = {
  getAll: () => getAll<User>(DB_KEYS.USERS),
  getById: (id: string) => getById<User>(DB_KEYS.USERS, id),
  getByEmail: (email: string) => {
    const users = getAll<User>(DB_KEYS.USERS);
    return users.find(u => u.email === email) || null;
  },
  create: (user: User) => create<User>(DB_KEYS.USERS, user),
  update: (id: string, updates: Partial<User>) => update<User>(DB_KEYS.USERS, id, updates),
  delete: (id: string) => remove<User>(DB_KEYS.USERS, id),
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
};

// Subject Operations
export const subjectDB = {
  getAll: () => getAll<Subject>(DB_KEYS.SUBJECTS),
  getById: (id: string) => getById<Subject>(DB_KEYS.SUBJECTS, id),
  getByGrade: (grade: number) => {
    const subjects = getAll<Subject>(DB_KEYS.SUBJECTS);
    return subjects.filter(s => s.grade === grade);
  },
  create: (subject: Subject) => create<Subject>(DB_KEYS.SUBJECTS, subject),
  update: (id: string, updates: Partial<Subject>) => update<Subject>(DB_KEYS.SUBJECTS, id, updates),
  delete: (id: string) => {
    const deletedIds = JSON.parse(localStorage.getItem(DB_KEYS.DELETED_SUBJECTS) || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem(DB_KEYS.DELETED_SUBJECTS, JSON.stringify(deletedIds));
    }
    return remove<Subject>(DB_KEYS.SUBJECTS, id);
  },
};

// Test Operations
export const testDB = {
  getAll: () => getAll<Test>(DB_KEYS.TESTS),
  getById: (id: string) => getById<Test>(DB_KEYS.TESTS, id),
  getBySubject: (subjectId: string) => {
    const tests = getAll<Test>(DB_KEYS.TESTS);
    return tests.filter(t => t.subjectId === subjectId);
  },
  getByTeacher: (teacherId: string) => {
    const tests = getAll<Test>(DB_KEYS.TESTS);
    return tests.filter(t => t.createdBy === teacherId);
  },
  create: (test: Test) => create<Test>(DB_KEYS.TESTS, test),
  update: (id: string, updates: Partial<Test>) => update<Test>(DB_KEYS.TESTS, id, updates),
  delete: (id: string) => remove<Test>(DB_KEYS.TESTS, id),
};

// Test Attempt Operations
export const testAttemptDB = {
  getAll: () => getAll<TestAttempt>(DB_KEYS.TEST_ATTEMPTS),
  getById: (id: string) => getById<TestAttempt>(DB_KEYS.TEST_ATTEMPTS, id),
  getByStudent: (studentId: string) => {
    const attempts = getAll<TestAttempt>(DB_KEYS.TEST_ATTEMPTS);
    return attempts.filter(a => a.studentId === studentId);
  },
  getByTest: (testId: string) => {
    const attempts = getAll<TestAttempt>(DB_KEYS.TEST_ATTEMPTS);
    return attempts.filter(a => a.testId === testId);
  },
  getStudentTestAttempts: (studentId: string, testId: string) => {
    const attempts = getAll<TestAttempt>(DB_KEYS.TEST_ATTEMPTS);
    return attempts.filter(a => a.studentId === studentId && a.testId === testId);
  },
  create: (attempt: TestAttempt) => create<TestAttempt>(DB_KEYS.TEST_ATTEMPTS, attempt),
  update: (id: string, updates: Partial<TestAttempt>) => update<TestAttempt>(DB_KEYS.TEST_ATTEMPTS, id, updates),
  delete: (id: string) => remove<TestAttempt>(DB_KEYS.TEST_ATTEMPTS, id),
};

// Progress Operations
export const progressDB = {
  getAll: () => getAll<StudentProgress>(DB_KEYS.PROGRESS),
  getByStudent: (studentId: string) => {
    const progress = getAll<StudentProgress>(DB_KEYS.PROGRESS);
    return progress.filter(p => p.studentId === studentId);
  },
  getByStudentAndSubject: (studentId: string, subjectId: string) => {
    const progress = getAll<StudentProgress>(DB_KEYS.PROGRESS);
    return progress.filter(p => p.studentId === studentId && p.subjectId === subjectId);
  },
  getByStudentAndChapter: (studentId: string, chapterId: string) => {
    const progress = getAll<StudentProgress>(DB_KEYS.PROGRESS);
    return progress.find(p => p.studentId === studentId && p.chapterId === chapterId) || null;
  },
  create: (progress: StudentProgress) => create<StudentProgress>(DB_KEYS.PROGRESS, progress),
  update: (studentId: string, chapterId: string, updates: Partial<StudentProgress>) => {
    const items = getAll<StudentProgress>(DB_KEYS.PROGRESS);
    const index = items.findIndex(p => p.studentId === studentId && p.chapterId === chapterId);
    if (index === -1) {
      items.push({ studentId, chapterId, ...updates } as StudentProgress);
    } else {
      items[index] = { ...items[index], ...updates };
    }
    localStorage.setItem(DB_KEYS.PROGRESS, JSON.stringify(items));
    return items[index];
  },
};

// Study Group Operations
export const studyGroupDB = {
  getAll: () => getAll<StudyGroup>(DB_KEYS.STUDY_GROUPS),
  getById: (id: string) => getById<StudyGroup>(DB_KEYS.STUDY_GROUPS, id),
  getBySubject: (subjectId: string) => {
    const groups = getAll<StudyGroup>(DB_KEYS.STUDY_GROUPS);
    return groups.filter(g => g.subjectId === subjectId);
  },
  getByMember: (userId: string) => {
    const groups = getAll<StudyGroup>(DB_KEYS.STUDY_GROUPS);
    return groups.filter(g => g.members.some(m => m.userId === userId));
  },
  create: (group: StudyGroup) => create<StudyGroup>(DB_KEYS.STUDY_GROUPS, group),
  update: (id: string, updates: Partial<StudyGroup>) => update<StudyGroup>(DB_KEYS.STUDY_GROUPS, id, updates),
  delete: (id: string) => remove<StudyGroup>(DB_KEYS.STUDY_GROUPS, id),
};

// Group Message Operations
export const groupMessageDB = {
  getAll: () => getAll<GroupMessage>(DB_KEYS.GROUP_MESSAGES),
  getByGroup: (groupId: string) => {
    const messages = getAll<GroupMessage>(DB_KEYS.GROUP_MESSAGES);
    return messages.filter(m => m.groupId === groupId).sort((a, b) => 
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  },
  create: (message: GroupMessage) => create<GroupMessage>(DB_KEYS.GROUP_MESSAGES, message),
};

// Gamification Operations
export const gamificationDB = {
  getAll: () => getAll<GamificationData>(DB_KEYS.GAMIFICATION),
  getByStudent: (studentId: string) => {
    const data = getAll<GamificationData>(DB_KEYS.GAMIFICATION);
    return data.find(g => g.studentId === studentId) || null;
  },
  create: (data: GamificationData) => create<GamificationData>(DB_KEYS.GAMIFICATION, data),
  update: (studentId: string, updates: Partial<GamificationData>) => {
    const items = getAll<GamificationData>(DB_KEYS.GAMIFICATION);
    const index = items.findIndex(g => g.studentId === studentId);
    if (index === -1) {
      const newData = { studentId, ...updates } as GamificationData;
      items.push(newData);
      localStorage.setItem(DB_KEYS.GAMIFICATION, JSON.stringify(items));
      return newData;
    }
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(DB_KEYS.GAMIFICATION, JSON.stringify(items));
    return items[index];
  },
  addBadge: (studentId: string, badge: Badge) => {
    const gamification = gamificationDB.getByStudent(studentId);
    if (!gamification) return null;
    if (gamification.badges.some(b => b.id === badge.id)) return gamification;
    
    const updatedBadges = [...gamification.badges, { ...badge, unlockedAt: new Date() }];
    return gamificationDB.update(studentId, { badges: updatedBadges });
  },
  addXP: (studentId: string, xp: number) => {
    const gamification = gamificationDB.getByStudent(studentId);
    if (!gamification) return null;
    
    const newXP = gamification.xp + xp;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    return gamificationDB.update(studentId, { 
      xp: newXP, 
      level: newLevel,
      totalStudyTime: gamification.totalStudyTime + 1 
    });
  },
};

// Battle Operations
export const battleDB = {
  getAll: () => getAll<Battle>(DB_KEYS.BATTLES),
  getById: (id: string) => getById<Battle>(DB_KEYS.BATTLES, id),
  getByPlayer: (playerId: string) => {
    const battles = getAll<Battle>(DB_KEYS.BATTLES);
    return battles.filter(b => b.player1Id === playerId || b.player2Id === playerId);
  },
  getWaitingBattles: () => {
    const battles = getAll<Battle>(DB_KEYS.BATTLES);
    return battles.filter(b => b.status === 'waiting');
  },
  create: (battle: Battle) => create<Battle>(DB_KEYS.BATTLES, battle),
  update: (id: string, updates: Partial<Battle>) => update<Battle>(DB_KEYS.BATTLES, id, updates),
  delete: (id: string) => remove<Battle>(DB_KEYS.BATTLES, id),
};

// Study Plan Operations
export const studyPlanDB = {
  getAll: () => getAll<StudyPlan>(DB_KEYS.STUDY_PLANS),
  getById: (id: string) => getById<StudyPlan>(DB_KEYS.STUDY_PLANS, id),
  getByStudent: (studentId: string) => {
    const plans = getAll<StudyPlan>(DB_KEYS.STUDY_PLANS);
    return plans.filter(p => p.studentId === studentId);
  },
  getActivePlan: (studentId: string) => {
    const plans = getAll<StudyPlan>(DB_KEYS.STUDY_PLANS);
    return plans.find(p => p.studentId === studentId && p.isActive) || null;
  },
  create: (plan: StudyPlan) => create<StudyPlan>(DB_KEYS.STUDY_PLANS, plan),
  update: (id: string, updates: Partial<StudyPlan>) => update<StudyPlan>(DB_KEYS.STUDY_PLANS, id, updates),
  delete: (id: string) => remove<StudyPlan>(DB_KEYS.STUDY_PLANS, id),
};

// Concept Mastery Operations
export const conceptMasteryDB = {
  getAll: () => getAll<ConceptMastery>(DB_KEYS.CONCEPT_MASTERY),
  getByStudent: (studentId: string) => {
    const mastery = getAll<ConceptMastery>(DB_KEYS.CONCEPT_MASTERY);
    return mastery.filter(m => m.studentId === studentId);
  },
  getByStudentAndSubject: (studentId: string, subjectId: string) => {
    const mastery = getAll<ConceptMastery>(DB_KEYS.CONCEPT_MASTERY);
    return mastery.filter(m => m.studentId === studentId && m.subjectId === subjectId);
  },
  update: (studentId: string, subjectId: string, chapterId: string, conceptName: string, isCorrect: boolean) => {
    const items = getAll<ConceptMastery>(DB_KEYS.CONCEPT_MASTERY);
    const index = items.findIndex(m => 
      m.studentId === studentId && 
      m.subjectId === subjectId && 
      m.chapterId === chapterId && 
      m.conceptName === conceptName
    );
    
    if (index === -1) {
      const newMastery: ConceptMastery = {
        studentId,
        subjectId,
        chapterId,
        conceptName,
        masteryLevel: isCorrect ? 20 : 0,
        attempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        lastPracticed: new Date(),
      };
      items.push(newMastery);
    } else {
      const m = items[index];
      m.attempts += 1;
      if (isCorrect) m.correctAttempts += 1;
      m.masteryLevel = Math.min(100, (m.correctAttempts / m.attempts) * 100);
      m.lastPracticed = new Date();
    }
    
    localStorage.setItem(DB_KEYS.CONCEPT_MASTERY, JSON.stringify(items));
    return items[index];
  },
};

// Voice Practice Operations
export const voicePracticeDB = {
  getAll: () => getAll<VoicePractice>(DB_KEYS.VOICE_PRACTICE),
  getByStudent: (studentId: string) => {
    const practices = getAll<VoicePractice>(DB_KEYS.VOICE_PRACTICE);
    return practices.filter(p => p.studentId === studentId);
  },
  create: (practice: VoicePractice) => create<VoicePractice>(DB_KEYS.VOICE_PRACTICE, practice),
};

// Tutor Message Operations
export const tutorMessageDB = {
  getAll: () => getAll<TutorMessage>(DB_KEYS.TUTOR_MESSAGES),
  getByStudent: (studentId: string) => {
    const messages = getAll<TutorMessage>(DB_KEYS.TUTOR_MESSAGES);
    return messages.filter(m => m.studentId === studentId).sort((a, b) => 
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  },
  create: (message: TutorMessage) => create<TutorMessage>(DB_KEYS.TUTOR_MESSAGES, message),
};

// Parent-Child Operations
export const parentChildDB = {
  getAll: () => getAll<ParentChild>(DB_KEYS.PARENT_CHILDREN),
  getByParent: (parentId: string) => {
    const relations = getAll<ParentChild>(DB_KEYS.PARENT_CHILDREN);
    return relations.filter(r => r.parentId === parentId);
  },
  getByChild: (childId: string) => {
    const relations = getAll<ParentChild>(DB_KEYS.PARENT_CHILDREN);
    return relations.find(r => r.childId === childId) || null;
  },
  create: (relation: ParentChild) => create<ParentChild>(DB_KEYS.PARENT_CHILDREN, relation),
  delete: (parentId: string, childId: string) => {
    const items = getAll<ParentChild>(DB_KEYS.PARENT_CHILDREN);
    const filtered = items.filter(r => !(r.parentId === parentId && r.childId === childId));
    localStorage.setItem(DB_KEYS.PARENT_CHILDREN, JSON.stringify(filtered));
    return true;
  },
};

// School Operations
export const schoolDB = {
  getAll: () => getAll<School>(DB_KEYS.SCHOOLS),
  getById: (id: string) => getById<School>(DB_KEYS.SCHOOLS, id),
  getByAdmin: (adminId: string) => {
    const schools = getAll<School>(DB_KEYS.SCHOOLS);
    return schools.find(s => s.adminId === adminId) || null;
  },
  create: (school: School) => create<School>(DB_KEYS.SCHOOLS, school),
  update: (id: string, updates: Partial<School>) => update<School>(DB_KEYS.SCHOOLS, id, updates),
  delete: (id: string) => remove<School>(DB_KEYS.SCHOOLS, id),
};

// Notification Operations
export const notificationDB = {
  getAll: () => getAll<Notification>(DB_KEYS.NOTIFICATIONS),
  getByUser: (userId: string) => {
    const notifications = getAll<Notification>(DB_KEYS.NOTIFICATIONS);
    return notifications.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getUnreadCount: (userId: string) => {
    const notifications = getAll<Notification>(DB_KEYS.NOTIFICATIONS);
    return notifications.filter(n => n.userId === userId && !n.read).length;
  },
  create: (notification: Notification) => create<Notification>(DB_KEYS.NOTIFICATIONS, notification),
  markAsRead: (id: string) => {
    return update<Notification>(DB_KEYS.NOTIFICATIONS, id, { read: true });
  },
  markAllAsRead: (userId: string) => {
    const items = getAll<Notification>(DB_KEYS.NOTIFICATIONS);
    items.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(items));
    return true;
  },
  delete: (id: string) => remove<Notification>(DB_KEYS.NOTIFICATIONS, id),
};

// Initialize sample data
export const initializeSampleData = () => {
  // 1. Check if we have already seeded the initial data
  // Using a specific flag instead of just checking if SUBJECTS exists
  if (localStorage.getItem(DB_KEYS.IS_SEEDED)) {
    return;
  }

  // Sample Subjects
  const subjects: Subject[] = [
    {
      id: 'math-10',
      name: 'Mathematics',
      description: 'Learn algebra, geometry, and more',
      icon: '🔢',
      color: 'bg-blue-500',
      grade: 10,
      chapters: [
        {
          id: 'math-10-ch1',
          subjectId: 'math-10',
          name: 'Real Numbers',
          description: 'Understanding real numbers and their properties',
          order: 1,
          content: 'Real numbers include rational and irrational numbers...',
          mcqs: [
            {
              id: 'q1',
              question: 'Which of the following is an irrational number?',
              options: ['22/7', '√2', '0.5', '3.14'],
              correctAnswer: 1,
              explanation: '√2 cannot be expressed as a fraction',
              difficulty: 'medium',
            },
            {
              id: 'q2',
              question: 'The decimal expansion of 1/7 is:',
              options: ['Terminating', 'Non-terminating repeating', 'Non-terminating non-repeating', 'None'],
              correctAnswer: 1,
              explanation: '1/7 = 0.142857142857...',
              difficulty: 'easy',
            },
          ],
        },
        {
          id: 'math-10-ch2',
          subjectId: 'math-10',
          name: 'Polynomials',
          description: 'Study of algebraic expressions',
          order: 2,
          content: 'Polynomials are expressions consisting of variables and coefficients...',
          mcqs: [
            {
              id: 'q3',
              question: 'Degree of polynomial 3x² + 5x + 7 is:',
              options: ['1', '2', '3', '0'],
              correctAnswer: 1,
              explanation: 'Highest power of x is 2',
              difficulty: 'easy',
            },
          ],
        },
        {
          id: 'math-10-ch3',
          subjectId: 'math-10',
          name: 'Linear Equations',
          description: 'Solving linear equations in two variables',
          order: 3,
          content: 'Linear equations in two variables have the form ax + by + c = 0...',
          mcqs: [
            {
              id: 'q4',
              question: 'A linear equation in two variables has:',
              options: ['One solution', 'Two solutions', 'Infinite solutions', 'No solution'],
              correctAnswer: 2,
              explanation: 'Linear equations in two variables have infinitely many solutions',
              difficulty: 'medium',
            },
          ],
        },
      ],
    },
    {
      id: 'science-10',
      name: 'Science',
      description: 'Physics, Chemistry, and Biology',
      icon: '🔬',
      color: 'bg-green-500',
      grade: 10,
      chapters: [
        {
          id: 'science-10-ch1',
          subjectId: 'science-10',
          name: 'Chemical Reactions',
          description: 'Types of chemical reactions',
          order: 1,
          content: 'Chemical reactions involve transformation of substances...',
          mcqs: [
            {
              id: 'q5',
              question: 'Rusting of iron is an example of:',
              options: ['Physical change', 'Chemical change', 'Both', 'None'],
              correctAnswer: 1,
              explanation: 'Rusting involves formation of new substance (iron oxide)',
              difficulty: 'easy',
            },
          ],
        },
        {
          id: 'science-10-ch2',
          subjectId: 'science-10',
          name: 'Acids, Bases and Salts',
          description: 'Properties of acids and bases',
          order: 2,
          content: 'Acids are sour in taste and turn blue litmus red...',
          mcqs: [
            {
              id: 'q6',
              question: 'pH of pure water is:',
              options: ['0', '7', '14', '1'],
              correctAnswer: 1,
              explanation: 'Pure water is neutral with pH 7',
              difficulty: 'easy',
            },
          ],
        },
      ],
    },
    {
      id: 'english-10',
      name: 'English',
      description: 'Grammar, Literature, and Writing',
      icon: '📖',
      color: 'bg-purple-500',
      grade: 10,
      chapters: [
        {
          id: 'english-10-ch1',
          subjectId: 'english-10',
          name: 'Grammar Fundamentals',
          description: 'Parts of speech and sentence structure',
          order: 1,
          content: 'Grammar is the system of a language...',
          mcqs: [
            {
              id: 'q7',
              question: 'Which is a noun?',
              options: ['Quickly', 'Beautiful', 'Table', 'Run'],
              correctAnswer: 2,
              explanation: 'Table is a naming word (noun)',
              difficulty: 'easy',
            },
          ],
        },
      ],
    },
  ];

  // Merge Class 5 subjects
  const allSubjects = [...subjects, ...class5Subjects];
  localStorage.setItem(DB_KEYS.SUBJECTS, JSON.stringify(allSubjects));

  // Sample Users
  const users: User[] = [
    {
      id: 'student1',
      name: 'Demo Student',
      email: 'student@demo.com',
      password: 'Demo@12345',
      role: 'student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
      createdAt: new Date(),
      isPremium: true,
    },
    {
      id: 'student2',
      name: 'Priya Patel',
      email: 'priya@demo.com',
      password: 'Demo@12345',
      role: 'student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      createdAt: new Date(),
      isPremium: false,
    },
    {
      id: 'teacher1',
      name: 'Demo Teacher',
      email: 'teacher@demo.com',
      password: 'Demo@12345',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
      createdAt: new Date(),
    },
    {
      id: 'admin1',
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: 'Demo@12345',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      createdAt: new Date(),
    },
    {
      id: 'parent1',
      name: 'Demo Parent',
      email: 'parent@demo.com',
      password: 'Demo@12345',
      role: 'parent',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=parent',
      createdAt: new Date(),
    },
  ];

  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

  // Initialize gamification data for students
  const gamificationData: GamificationData[] = [
    {
      studentId: 'student1',
      xp: 2500,
      level: 3,
      streak: 5,
      lastStudyDate: new Date(),
      totalStudyTime: 120,
      badges: [],
      unlockedAvatars: ['default'],
      unlockedThemes: ['default'],
      currentAvatar: 'default',
      coins: 500,
    },
    {
      studentId: 'student2',
      xp: 1500,
      level: 2,
      streak: 3,
      lastStudyDate: new Date(),
      totalStudyTime: 80,
      badges: [],
      unlockedAvatars: ['default'],
      unlockedThemes: ['default'],
      currentAvatar: 'default',
      coins: 300,
    },
  ];

  localStorage.setItem(DB_KEYS.GAMIFICATION, JSON.stringify(gamificationData));

  // Parent-Child relationship
  const parentChildren: ParentChild[] = [
    { parentId: 'parent1', childId: 'student1', addedAt: new Date() },
  ];

  localStorage.setItem(DB_KEYS.PARENT_CHILDREN, JSON.stringify(parentChildren));

  localStorage.setItem(DB_KEYS.TESTS, JSON.stringify(class5Tests));

  // Mark as seeded so we don't restore deletions on next refresh
  localStorage.setItem(DB_KEYS.IS_SEEDED, 'true');
};

// Force reset and reinitialize (call from browser console: window.__resetDB())
export const resetAndReinitialize = () => {
  Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  initializeSampleData();
  window.location.reload();
};

// Expose globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).__resetDB = resetAndReinitialize;
}

export default {
  userDB,
  subjectDB,
  testDB,
  testAttemptDB,
  progressDB,
  studyGroupDB,
  groupMessageDB,
  gamificationDB,
  battleDB,
  studyPlanDB,
  conceptMasteryDB,
  voicePracticeDB,
  tutorMessageDB,
  parentChildDB,
  schoolDB,
  notificationDB,
  initializeSampleData,
};
