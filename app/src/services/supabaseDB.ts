import { supabase } from './supabase';
import type { 
  User, Subject, Chapter, MCQ, Test, TestAttempt, 
  StudyGroup, GroupMessage, GamificationData, Battle,
  Homework, HomeworkSubmission,
  School, Notification, Badge, TeacherAnalytics,
  StudentProgress, StudyPlan, ConceptMastery, ParentChild
} from '@/types';

// Helper type
/* eslint-disable @typescript-eslint/no-explicit-any */

// User Operations
export const userDB = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar || undefined,
      createdAt: new Date(u.created_at),
      isPremium: u.is_premium,
      schoolId: u.school_id || undefined,
      password: '',
    }));
  },

  getById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return null;
    const d = data as any;
    return {
      id: d.id,
      email: d.email,
      name: d.name,
      role: d.role,
      avatar: d.avatar || undefined,
      createdAt: new Date(d.created_at),
      isPremium: d.is_premium,
      schoolId: d.school_id || undefined,
      password: '',
    };
  },

  getByEmail: async (email: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !data) return null;
    const d = data as any;
    return {
      id: d.id,
      email: d.email,
      name: d.name,
      role: d.role,
      avatar: d.avatar || undefined,
      createdAt: new Date(d.created_at),
      isPremium: d.is_premium,
      schoolId: d.school_id || undefined,
      password: '',
    };
  },

  update: async (id: string, updates: Partial<User>): Promise<User | null> => {
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        role: updates.role,
        avatar: updates.avatar,
        is_premium: updates.isPremium,
        school_id: updates.schoolId,
      })
      .eq('id', id);
    if (error) return null;
    return userDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
  },
};

// Subject Operations
export const subjectDB = {
  getAll: async (): Promise<Subject[]> => {
    const { data: subjects, error } = await supabase.from('subjects').select('*');
    if (error) throw error;
    
    const result: Subject[] = [];
    for (const subject of subjects || []) {
      const s = subject as any;
      const { data: chapters } = await supabase
        .from('chapters')
        .select('*, mcqs(*)')
        .eq('subject_id', s.id);
      
      result.push({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        color: s.color,
        grade: s.grade,
        chapters: (chapters as any[])?.map(ch => ({
          id: ch.id,
          subjectId: ch.subject_id,
          name: ch.name,
          description: ch.description,
          order: ch.order,
          content: ch.content,
          videoUrl: ch.video_url || undefined,
          mcqs: ch.mcqs?.map((mcq: any) => ({
            id: mcq.id,
            question: mcq.question,
            options: mcq.options,
            correctAnswer: mcq.correct_answer,
            explanation: mcq.explanation,
            difficulty: mcq.difficulty,
          })) || [],
        })) || [],
      });
    }
    return result;
  },

  getById: async (id: string): Promise<Subject | null> => {
    const { data: subject, error } = await supabase.from('subjects').select('*').eq('id', id).single();
    if (error || !subject) return null;
    const s = subject as any;

    const { data: chapters } = await supabase
      .from('chapters')
      .select('*, mcqs(*)')
      .eq('subject_id', id);

    return {
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      color: s.color,
      grade: s.grade,
      chapters: (chapters as any[])?.map(ch => ({
        id: ch.id,
        subjectId: ch.subject_id,
        name: ch.name,
        description: ch.description,
        order: ch.order,
        content: ch.content,
        videoUrl: ch.video_url || undefined,
        mcqs: ch.mcqs?.map((mcq: any) => ({
          id: mcq.id,
          question: mcq.question,
          options: mcq.options,
          correctAnswer: mcq.correct_answer,
          explanation: mcq.explanation,
          difficulty: mcq.difficulty,
        })) || [],
      })) || [],
    };
  },

  getByGrade: async (grade: number): Promise<Subject[]> => {
    const allSubjects = await subjectDB.getAll();
    return allSubjects.filter(s => s.grade === grade);
  },

  create: async (subject: Subject): Promise<Subject> => {
    const { error } = await supabase
      .from('subjects')
      .insert({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        color: subject.color,
        grade: subject.grade,
      });
    if (error) throw error;
    return subject;
  },

  update: async (id: string, updates: Partial<Subject>): Promise<Subject | null> => {
    const { error } = await supabase
      .from('subjects')
      .update({
        name: updates.name,
        description: updates.description,
        icon: updates.icon,
        color: updates.color,
        grade: updates.grade,
      })
      .eq('id', id);
    if (error) return null;
    return subjectDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    return !error;
  },
};

// Chapter Operations
export const chapterDB = {
  create: async (chapter: Chapter): Promise<Chapter> => {
    const { error } = await supabase
      .from('chapters')
      .insert({
        id: chapter.id,
        subject_id: chapter.subjectId,
        name: chapter.name,
        description: chapter.description,
        order: chapter.order,
        content: chapter.content,
        video_url: chapter.videoUrl,
      });
    if (error) throw error;
    return chapter;
  },

  update: async (id: string, updates: Partial<Chapter>): Promise<Chapter | null> => {
    const { error } = await supabase
      .from('chapters')
      .update({
        name: updates.name,
        description: updates.description,
        order: updates.order,
        content: updates.content,
        video_url: updates.videoUrl,
        image_url: (updates as any).imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) return null;
    const { data } = await supabase.from('chapters').select('*').eq('id', id).single();
    if (!data) return null;
    const d = data as any;
    return {
      id: d.id,
      subjectId: d.subject_id,
      name: d.name,
      description: d.description,
      order: d.order,
      content: d.content,
      videoUrl: d.video_url || undefined,
      mcqs: [],
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    return !error;
  },
};

// MCQ Operations
export const mcqDB = {
  create: async (mcq: MCQ, chapterId: string): Promise<MCQ> => {
    const { error } = await supabase
      .from('mcqs')
      .insert({
        id: mcq.id,
        chapter_id: chapterId,
        question: mcq.question,
        options: mcq.options,
        correct_answer: mcq.correctAnswer,
        explanation: mcq.explanation,
        difficulty: mcq.difficulty,
      });
    if (error) throw error;
    return mcq;
  },

  createBulk: async (mcqs: MCQ[], chapterId: string): Promise<MCQ[]> => {
    const inserts = mcqs.map(mcq => ({
      id: mcq.id,
      chapter_id: chapterId,
      question: mcq.question,
      options: mcq.options,
      correct_answer: mcq.correctAnswer,
      explanation: mcq.explanation,
      difficulty: mcq.difficulty,
    }));
    const { error } = await supabase.from('mcqs').insert(inserts);
    if (error) throw error;
    return mcqs;
  },
};

// Test Operations
export const testDB = {
  getAll: async (): Promise<Test[]> => {
    const { data, error } = await supabase.from('tests').select('*');
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      subjectId: t.subject_id,
      chapterIds: t.chapter_ids,
      questions: t.questions as any[],
      duration: t.duration,
      totalMarks: t.total_marks,
      passingMarks: t.passing_marks,
      createdBy: t.created_by,
      createdAt: new Date(t.created_at),
      isActive: t.is_active,
    }));
  },

  getById: async (id: string): Promise<Test | null> => {
    const { data, error } = await supabase.from('tests').select('*').eq('id', id).single();
    if (error || !data) return null;
    const t = data as any;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      subjectId: t.subject_id,
      chapterIds: t.chapter_ids,
      questions: t.questions as any[],
      duration: t.duration,
      totalMarks: t.total_marks,
      passingMarks: t.passing_marks,
      createdBy: t.created_by,
      createdAt: new Date(t.created_at),
      isActive: t.is_active,
    };
  },

  getBySubject: async (subjectId: string): Promise<Test[]> => {
    const { data, error } = await supabase.from('tests').select('*').eq('subject_id', subjectId);
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      subjectId: t.subject_id,
      chapterIds: t.chapter_ids,
      questions: t.questions as any[],
      duration: t.duration,
      totalMarks: t.total_marks,
      passingMarks: t.passing_marks,
      createdBy: t.created_by,
      createdAt: new Date(t.created_at),
      isActive: t.is_active,
    }));
  },

  getByTeacher: async (teacherId: string): Promise<Test[]> => {
    const { data, error } = await supabase.from('tests').select('*').eq('created_by', teacherId);
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      subjectId: t.subject_id,
      chapterIds: t.chapter_ids,
      questions: t.questions as any[],
      duration: t.duration,
      totalMarks: t.total_marks,
      passingMarks: t.passing_marks,
      createdBy: t.created_by,
      createdAt: new Date(t.created_at),
      isActive: t.is_active,
    }));
  },

  create: async (test: Test): Promise<Test> => {
    const { error } = await supabase
      .from('tests')
      .insert({
        id: test.id,
        title: test.title,
        description: test.description,
        subject_id: test.subjectId,
        chapter_ids: test.chapterIds,
        questions: test.questions,
        duration: test.duration,
        total_marks: test.totalMarks,
        passing_marks: test.passingMarks,
        created_by: test.createdBy,
        is_active: test.isActive,
      });
    if (error) throw error;
    return test;
  },

  update: async (id: string, updates: Partial<Test>): Promise<Test | null> => {
    const { error } = await supabase
      .from('tests')
      .update({
        title: updates.title,
        description: updates.description,
        subject_id: updates.subjectId,
        chapter_ids: updates.chapterIds,
        questions: updates.questions,
        duration: updates.duration,
        total_marks: updates.totalMarks,
        passing_marks: updates.passingMarks,
        is_active: updates.isActive,
      })
      .eq('id', id);
    if (error) return null;
    return testDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('tests').delete().eq('id', id);
    return !error;
  },
};

// Test Attempt Operations
export const testAttemptDB = {
  getAll: async (): Promise<TestAttempt[]> => {
    const { data, error } = await supabase.from('test_results').select('*');
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      testId: t.test_id,
      studentId: t.student_id,
      answers: t.answers,
      score: t.score,
      totalMarks: t.total_marks,
      percentage: t.percentage,
      timeTaken: t.time_taken,
      completedAt: new Date(t.completed_at),
      isPassed: t.is_passed,
    }));
  },

  getById: async (id: string): Promise<TestAttempt | null> => {
    const { data, error } = await supabase.from('test_results').select('*').eq('id', id).single();
    if (error || !data) return null;
    const t = data as any;
    return {
      id: t.id,
      testId: t.test_id,
      studentId: t.student_id,
      answers: t.answers,
      score: t.score,
      totalMarks: t.total_marks,
      percentage: t.percentage,
      timeTaken: t.time_taken,
      completedAt: new Date(t.completed_at),
      isPassed: t.is_passed,
    };
  },

  getByStudent: async (studentId: string): Promise<TestAttempt[]> => {
    const { data, error } = await supabase.from('test_results').select('*').eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      testId: t.test_id,
      studentId: t.student_id,
      answers: t.answers,
      score: t.score,
      totalMarks: t.total_marks,
      percentage: t.percentage,
      timeTaken: t.time_taken,
      completedAt: new Date(t.completed_at),
      isPassed: t.is_passed,
    }));
  },

  getByTest: async (testId: string): Promise<TestAttempt[]> => {
    const { data, error } = await supabase.from('test_results').select('*').eq('test_id', testId);
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      testId: t.test_id,
      studentId: t.student_id,
      answers: t.answers,
      score: t.score,
      totalMarks: t.total_marks,
      percentage: t.percentage,
      timeTaken: t.time_taken,
      completedAt: new Date(t.completed_at),
      isPassed: t.is_passed,
    }));
  },

  create: async (attempt: TestAttempt): Promise<TestAttempt> => {
    const { error } = await supabase
      .from('test_results')
      .insert({
        id: attempt.id,
        test_id: attempt.testId,
        student_id: attempt.studentId,
        answers: attempt.answers,
        score: attempt.score,
        total_marks: attempt.totalMarks,
        percentage: attempt.percentage,
        time_taken: attempt.timeTaken,
        is_passed: attempt.isPassed,
      });
    if (error) throw error;
    return attempt;
  },
};

// Homework Operations
export const homeworkDB = {
  getAll: async (): Promise<Homework[]> => {
    const { data, error } = await supabase.from('homework').select('*');
    if (error) throw error;
    return (data || []).map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      subjectId: h.subject_id,
      chapterId: h.chapter_id,
      teacherId: h.teacher_id,
      fileUrl: h.file_url,
      fileName: h.file_name,
      dueDate: new Date(h.due_date),
      maxMarks: h.max_marks,
      createdAt: new Date(h.created_at),
      updatedAt: new Date(h.updated_at),
    }));
  },

  getById: async (id: string): Promise<Homework | null> => {
    const { data, error } = await supabase.from('homework').select('*').eq('id', id).single();
    if (error || !data) return null;
    const h = data as any;
    return {
      id: h.id,
      title: h.title,
      description: h.description,
      subjectId: h.subject_id,
      chapterId: h.chapter_id,
      teacherId: h.teacher_id,
      fileUrl: h.file_url,
      fileName: h.file_name,
      dueDate: new Date(h.due_date),
      maxMarks: h.max_marks,
      createdAt: new Date(h.created_at),
      updatedAt: new Date(h.updated_at),
    };
  },

  getByTeacher: async (teacherId: string): Promise<Homework[]> => {
    const { data, error } = await supabase.from('homework').select('*').eq('teacher_id', teacherId);
    if (error) throw error;
    return (data || []).map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      subjectId: h.subject_id,
      chapterId: h.chapter_id,
      teacherId: h.teacher_id,
      fileUrl: h.file_url,
      fileName: h.file_name,
      dueDate: new Date(h.due_date),
      maxMarks: h.max_marks,
      createdAt: new Date(h.created_at),
      updatedAt: new Date(h.updated_at),
    }));
  },

  getBySubject: async (subjectId: string): Promise<Homework[]> => {
    const { data, error } = await supabase.from('homework').select('*').eq('subject_id', subjectId);
    if (error) throw error;
    return (data || []).map((h: any) => ({
      id: h.id,
      title: h.title,
      description: h.description,
      subjectId: h.subject_id,
      chapterId: h.chapter_id,
      teacherId: h.teacher_id,
      fileUrl: h.file_url,
      fileName: h.file_name,
      dueDate: new Date(h.due_date),
      maxMarks: h.max_marks,
      createdAt: new Date(h.created_at),
      updatedAt: new Date(h.updated_at),
    }));
  },

  create: async (homework: Homework): Promise<Homework> => {
    const { error } = await supabase
      .from('homework')
      .insert({
        id: homework.id,
        title: homework.title,
        description: homework.description,
        subject_id: homework.subjectId,
        chapter_id: homework.chapterId,
        teacher_id: homework.teacherId,
        file_url: homework.fileUrl,
        file_name: homework.fileName,
        due_date: homework.dueDate.toISOString(),
        max_marks: homework.maxMarks,
      });
    if (error) throw error;
    return homework;
  },

  update: async (id: string, updates: Partial<Homework>): Promise<Homework | null> => {
    const { error } = await supabase
      .from('homework')
      .update({
        title: updates.title,
        description: updates.description,
        subject_id: updates.subjectId,
        chapter_id: updates.chapterId,
        file_url: updates.fileUrl,
        file_name: updates.fileName,
        due_date: updates.dueDate?.toISOString(),
        max_marks: updates.maxMarks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) return null;
    return homeworkDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('homework').delete().eq('id', id);
    return !error;
  },
};

// Homework Submission Operations
export const homeworkSubmissionDB = {
  getAll: async (): Promise<HomeworkSubmission[]> => {
    const { data, error } = await supabase.from('homework_submissions').select('*');
    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      homeworkId: s.homework_id,
      studentId: s.student_id,
      fileUrl: s.file_url,
      fileName: s.file_name,
      answerText: s.answer_text,
      submittedAt: new Date(s.submitted_at),
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
    }));
  },

  getById: async (id: string): Promise<HomeworkSubmission | null> => {
    const { data, error } = await supabase.from('homework_submissions').select('*').eq('id', id).single();
    if (error || !data) return null;
    const s = data as any;
    return {
      id: s.id,
      homeworkId: s.homework_id,
      studentId: s.student_id,
      fileUrl: s.file_url,
      fileName: s.file_name,
      answerText: s.answer_text,
      submittedAt: new Date(s.submitted_at),
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
    };
  },

  getByHomework: async (homeworkId: string): Promise<HomeworkSubmission[]> => {
    const { data, error } = await supabase.from('homework_submissions').select('*').eq('homework_id', homeworkId);
    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      homeworkId: s.homework_id,
      studentId: s.student_id,
      fileUrl: s.file_url,
      fileName: s.file_name,
      answerText: s.answer_text,
      submittedAt: new Date(s.submitted_at),
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
    }));
  },

  getByStudent: async (studentId: string): Promise<HomeworkSubmission[]> => {
    const { data, error } = await supabase.from('homework_submissions').select('*').eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      homeworkId: s.homework_id,
      studentId: s.student_id,
      fileUrl: s.file_url,
      fileName: s.file_name,
      answerText: s.answer_text,
      submittedAt: new Date(s.submitted_at),
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
    }));
  },

  getByStudentAndHomework: async (studentId: string, homeworkId: string): Promise<HomeworkSubmission | null> => {
    const { data, error } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('student_id', studentId)
      .eq('homework_id', homeworkId)
      .single();
    if (error || !data) return null;
    const s = data as any;
    return {
      id: s.id,
      homeworkId: s.homework_id,
      studentId: s.student_id,
      fileUrl: s.file_url,
      fileName: s.file_name,
      answerText: s.answer_text,
      submittedAt: new Date(s.submitted_at),
      marks: s.marks,
      feedback: s.feedback,
      status: s.status,
    };
  },

  create: async (submission: HomeworkSubmission): Promise<HomeworkSubmission> => {
    const { error } = await supabase
      .from('homework_submissions')
      .insert({
        id: submission.id,
        homework_id: submission.homeworkId,
        student_id: submission.studentId,
        file_url: submission.fileUrl,
        file_name: submission.fileName,
        answer_text: submission.answerText,
        marks: submission.marks,
        feedback: submission.feedback,
        status: submission.status,
      });
    if (error) throw error;
    return submission;
  },

  update: async (id: string, updates: Partial<HomeworkSubmission>): Promise<HomeworkSubmission | null> => {
    const { error } = await supabase
      .from('homework_submissions')
      .update({
        file_url: updates.fileUrl,
        file_name: updates.fileName,
        answer_text: updates.answerText,
        marks: updates.marks,
        feedback: updates.feedback,
        status: updates.status,
      })
      .eq('id', id);
    if (error) return null;
    return homeworkSubmissionDB.getById(id);
  },
};

// Gamification Operations
export const gamificationDB = {
  getAll: async (): Promise<GamificationData[]> => {
    const { data, error } = await supabase.from('gamification').select('*');
    if (error) throw error;
    return (data || []).map((g: any) => ({
      studentId: g.student_id,
      xp: g.xp,
      level: g.level,
      streak: g.streak,
      lastStudyDate: g.last_study_date ? new Date(g.last_study_date) : new Date(),
      totalStudyTime: g.total_study_time,
      badges: g.badges as Badge[],
      unlockedAvatars: g.unlocked_avatars,
      unlockedThemes: g.unlocked_themes,
      currentAvatar: g.current_avatar,
      coins: g.coins,
    }));
  },

  getByStudent: async (studentId: string): Promise<GamificationData | null> => {
    const { data, error } = await supabase.from('gamification').select('*').eq('student_id', studentId).single();
    if (error || !data) return null;
    const g = data as any;
    return {
      studentId: g.student_id,
      xp: g.xp,
      level: g.level,
      streak: g.streak,
      lastStudyDate: g.last_study_date ? new Date(g.last_study_date) : new Date(),
      totalStudyTime: g.total_study_time,
      badges: g.badges as Badge[],
      unlockedAvatars: g.unlocked_avatars,
      unlockedThemes: g.unlocked_themes,
      currentAvatar: g.current_avatar,
      coins: g.coins,
    };
  },

  create: async (data: GamificationData): Promise<GamificationData> => {
    const { error } = await supabase
      .from('gamification')
      .insert({
        student_id: data.studentId,
        xp: data.xp,
        level: data.level,
        streak: data.streak,
        last_study_date: data.lastStudyDate?.toISOString(),
        total_study_time: data.totalStudyTime,
        badges: data.badges,
        unlocked_avatars: data.unlockedAvatars,
        unlocked_themes: data.unlockedThemes,
        current_avatar: data.currentAvatar,
        coins: data.coins,
      });
    if (error) throw error;
    return data;
  },

  update: async (studentId: string, updates: Partial<GamificationData>): Promise<GamificationData | null> => {
    const { error } = await supabase
      .from('gamification')
      .update({
        xp: updates.xp,
        level: updates.level,
        streak: updates.streak,
        last_study_date: updates.lastStudyDate?.toISOString(),
        total_study_time: updates.totalStudyTime,
        badges: updates.badges,
        unlocked_avatars: updates.unlockedAvatars,
        unlocked_themes: updates.unlockedThemes,
        current_avatar: updates.currentAvatar,
        coins: updates.coins,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId);
    if (error) return null;
    return gamificationDB.getByStudent(studentId);
  },

  addBadge: async (studentId: string, badge: Badge): Promise<GamificationData | null> => {
    const gamification = await gamificationDB.getByStudent(studentId);
    if (!gamification) return null;
    if (gamification.badges.some(b => b.id === badge.id)) return gamification;
    
    const updatedBadges = [...gamification.badges, { ...badge, unlockedAt: new Date() }];
    return gamificationDB.update(studentId, { badges: updatedBadges });
  },

  addXP: async (studentId: string, xp: number): Promise<GamificationData | null> => {
    const gamification = await gamificationDB.getByStudent(studentId);
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

// Study Group Operations
export const studyGroupDB = {
  getAll: async (): Promise<StudyGroup[]> => {
    const { data, error } = await supabase.from('study_groups').select('*');
    if (error) throw error;
    return (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      subjectId: g.subject_id,
      createdBy: g.created_by,
      members: g.members as any[],
      maxMembers: g.max_members,
      createdAt: new Date(g.created_at),
    }));
  },

  getById: async (id: string): Promise<StudyGroup | null> => {
    const { data, error } = await supabase.from('study_groups').select('*').eq('id', id).single();
    if (error || !data) return null;
    const g = data as any;
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      subjectId: g.subject_id,
      createdBy: g.created_by,
      members: g.members as any[],
      maxMembers: g.max_members,
      createdAt: new Date(g.created_at),
    };
  },

  getBySubject: async (subjectId: string): Promise<StudyGroup[]> => {
    const { data, error } = await supabase.from('study_groups').select('*').eq('subject_id', subjectId);
    if (error) throw error;
    return (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      subjectId: g.subject_id,
      createdBy: g.created_by,
      members: g.members as any[],
      maxMembers: g.max_members,
      createdAt: new Date(g.created_at),
    }));
  },

  getByMember: async (userId: string): Promise<StudyGroup[]> => {
    const { data, error } = await supabase.from('study_groups').select('*');
    if (error) throw error;
    return (data || [])
      .filter((g: any) => (g.members as any[]).some((m: any) => m.userId === userId))
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        subjectId: g.subject_id,
        createdBy: g.created_by,
        members: g.members as any[],
        maxMembers: g.max_members,
        createdAt: new Date(g.created_at),
      }));
  },

  create: async (group: StudyGroup): Promise<StudyGroup> => {
    const { error } = await supabase
      .from('study_groups')
      .insert({
        id: group.id,
        name: group.name,
        description: group.description,
        subject_id: group.subjectId,
        created_by: group.createdBy,
        members: group.members,
        max_members: group.maxMembers,
      });
    if (error) throw error;
    return group;
  },

  update: async (id: string, updates: Partial<StudyGroup>): Promise<StudyGroup | null> => {
    const { error } = await supabase
      .from('study_groups')
      .update({
        name: updates.name,
        description: updates.description,
        subject_id: updates.subjectId,
        members: updates.members,
        max_members: updates.maxMembers,
      })
      .eq('id', id);
    if (error) return null;
    return studyGroupDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('study_groups').delete().eq('id', id);
    return !error;
  },
};

// Group Message Operations
export const groupMessageDB = {
  getAll: async (): Promise<GroupMessage[]> => {
    const { data, error } = await supabase.from('group_messages').select('*');
    if (error) throw error;
    return (data || []).map((m: any) => ({
      id: m.id,
      groupId: m.group_id,
      userId: m.user_id,
      message: m.message,
      sentAt: new Date(m.sent_at),
    }));
  },

  getByGroup: async (groupId: string): Promise<GroupMessage[]> => {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('sent_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((m: any) => ({
      id: m.id,
      groupId: m.group_id,
      userId: m.user_id,
      message: m.message,
      sentAt: new Date(m.sent_at),
    }));
  },

  create: async (message: GroupMessage): Promise<GroupMessage> => {
    const { error } = await supabase
      .from('group_messages')
      .insert({
        id: message.id,
        group_id: message.groupId,
        user_id: message.userId,
        message: message.message,
        sent_at: message.sentAt.toISOString(),
      });
    if (error) throw error;
    return message;
  },
};

// Battle Operations
export const battleDB = {
  getAll: async (): Promise<Battle[]> => {
    const { data, error } = await supabase.from('battles').select('*');
    if (error) throw error;
    return (data || []).map((b: any) => ({
      id: b.id,
      subjectId: b.subject_id,
      chapterId: b.chapter_id || undefined,
      player1Id: b.player1_id,
      player2Id: b.player2_id || undefined,
      player1Score: b.player1_score,
      player2Score: b.player2_score,
      player1Answers: b.player1_answers,
      player2Answers: b.player2_answers,
      questions: b.questions as any[],
      status: b.status,
      winnerId: b.winner_id || undefined,
      createdAt: new Date(b.created_at),
      startedAt: b.started_at ? new Date(b.started_at) : undefined,
      completedAt: b.completed_at ? new Date(b.completed_at) : undefined,
    }));
  },

  getById: async (id: string): Promise<Battle | null> => {
    const { data, error } = await supabase.from('battles').select('*').eq('id', id).single();
    if (error || !data) return null;
    const b = data as any;
    return {
      id: b.id,
      subjectId: b.subject_id,
      chapterId: b.chapter_id || undefined,
      player1Id: b.player1_id,
      player2Id: b.player2_id || undefined,
      player1Score: b.player1_score,
      player2Score: b.player2_score,
      player1Answers: b.player1_answers,
      player2Answers: b.player2_answers,
      questions: b.questions as any[],
      status: b.status,
      winnerId: b.winner_id || undefined,
      createdAt: new Date(b.created_at),
      startedAt: b.started_at ? new Date(b.started_at) : undefined,
      completedAt: b.completed_at ? new Date(b.completed_at) : undefined,
    };
  },

  getByPlayer: async (playerId: string): Promise<Battle[]> => {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);
    if (error) throw error;
    return (data || []).map((b: any) => ({
      id: b.id,
      subjectId: b.subject_id,
      chapterId: b.chapter_id || undefined,
      player1Id: b.player1_id,
      player2Id: b.player2_id || undefined,
      player1Score: b.player1_score,
      player2Score: b.player2_score,
      player1Answers: b.player1_answers,
      player2Answers: b.player2_answers,
      questions: b.questions as any[],
      status: b.status,
      winnerId: b.winner_id || undefined,
      createdAt: new Date(b.created_at),
      startedAt: b.started_at ? new Date(b.started_at) : undefined,
      completedAt: b.completed_at ? new Date(b.completed_at) : undefined,
    }));
  },

  getWaitingBattles: async (): Promise<Battle[]> => {
    const { data, error } = await supabase.from('battles').select('*').eq('status', 'waiting');
    if (error) throw error;
    return (data || []).map((b: any) => ({
      id: b.id,
      subjectId: b.subject_id,
      chapterId: b.chapter_id || undefined,
      player1Id: b.player1_id,
      player2Id: b.player2_id || undefined,
      player1Score: b.player1_score,
      player2Score: b.player2_score,
      player1Answers: b.player1_answers,
      player2Answers: b.player2_answers,
      questions: b.questions as any[],
      status: b.status,
      winnerId: b.winner_id || undefined,
      createdAt: new Date(b.created_at),
      startedAt: b.started_at ? new Date(b.started_at) : undefined,
      completedAt: b.completed_at ? new Date(b.completed_at) : undefined,
    }));
  },

  create: async (battle: Battle): Promise<Battle> => {
    const { error } = await supabase
      .from('battles')
      .insert({
        id: battle.id,
        subject_id: battle.subjectId,
        chapter_id: battle.chapterId,
        player1_id: battle.player1Id,
        player2_id: battle.player2Id,
        player1_score: battle.player1Score,
        player2_score: battle.player2Score,
        player1_answers: battle.player1Answers,
        player2_answers: battle.player2Answers,
        questions: battle.questions,
        status: battle.status,
        winner_id: battle.winnerId,
        created_at: battle.createdAt.toISOString(),
        started_at: battle.startedAt?.toISOString(),
        completed_at: battle.completedAt?.toISOString(),
      });
    if (error) throw error;
    return battle;
  },

  update: async (id: string, updates: Partial<Battle>): Promise<Battle | null> => {
    const { error } = await supabase
      .from('battles')
      .update({
        player2_id: updates.player2Id,
        player1_score: updates.player1Score,
        player2_score: updates.player2Score,
        player1_answers: updates.player1Answers,
        player2_answers: updates.player2Answers,
        status: updates.status,
        winner_id: updates.winnerId,
        started_at: updates.startedAt?.toISOString(),
        completed_at: updates.completedAt?.toISOString(),
      })
      .eq('id', id);
    if (error) return null;
    return battleDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('battles').delete().eq('id', id);
    return !error;
  },
};

// Tutor Message Operations
export const tutorMessageDB = {
  getAll: async (): Promise<any[]> => {
    const { data, error } = await supabase.from('tutor_messages').select('*');
    if (error) throw error;
    return (data || []).map((m: any) => ({
      id: m.id,
      studentId: m.student_id,
      message: m.message,
      response: m.response,
      subjectId: m.subject_id || undefined,
      chapterId: m.chapter_id || undefined,
      sentAt: new Date(m.sent_at),
    }));
  },

  getByStudent: async (studentId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('tutor_messages')
      .select('*')
      .eq('student_id', studentId)
      .order('sent_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((m: any) => ({
      id: m.id,
      studentId: m.student_id,
      message: m.message,
      response: m.response,
      subjectId: m.subject_id || undefined,
      chapterId: m.chapter_id || undefined,
      sentAt: new Date(m.sent_at),
    }));
  },

  create: async (message: any): Promise<any> => {
    const { error } = await supabase
      .from('tutor_messages')
      .insert({
        id: message.id,
        student_id: message.studentId,
        message: message.message,
        response: message.response,
        subject_id: message.subjectId,
        chapter_id: message.chapterId,
        sent_at: message.sentAt.toISOString(),
      });
    if (error) throw error;
    return message;
  },
};

// Notification Operations
export const notificationDB = {
  getAll: async (): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*');
    if (error) throw error;
    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: new Date(n.created_at),
      actionUrl: n.action_url || undefined,
    }));
  },

  getByUser: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: new Date(n.created_at),
      actionUrl: n.action_url || undefined,
    }));
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) return 0;
    return count || 0;
  },

  create: async (notification: Notification): Promise<Notification> => {
    const { error } = await supabase
      .from('notifications')
      .insert({
        id: notification.id,
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        created_at: notification.createdAt.toISOString(),
        action_url: notification.actionUrl,
      });
    if (error) throw error;
    return notification;
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    return !error;
  },

  markAllAsRead: async (userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    return !error;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return !error;
  },
};

// School Operations
export const schoolDB = {
  getAll: async (): Promise<School[]> => {
    const { data, error } = await supabase.from('schools').select('*');
    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      contactEmail: s.contact_email,
      contactPhone: s.contact_phone,
      adminId: s.admin_id,
      subscription: {
        plan: s.subscription_plan,
        startDate: new Date(s.subscription_start),
        endDate: new Date(s.subscription_end),
        maxTeachers: s.max_teachers,
        maxStudents: s.max_students,
        features: s.features,
        price: 0,
      },
      teachers: [],
      students: [],
      createdAt: new Date(s.created_at),
    }));
  },

  getById: async (id: string): Promise<School | null> => {
    const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();
    if (error || !data) return null;
    const s = data as any;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      contactEmail: s.contact_email,
      contactPhone: s.contact_phone,
      adminId: s.admin_id,
      subscription: {
        plan: s.subscription_plan,
        startDate: new Date(s.subscription_start),
        endDate: new Date(s.subscription_end),
        maxTeachers: s.max_teachers,
        maxStudents: s.max_students,
        features: s.features,
        price: 0,
      },
      teachers: [],
      students: [],
      createdAt: new Date(s.created_at),
    };
  },

  getByAdmin: async (adminId: string): Promise<School | null> => {
    const { data, error } = await supabase.from('schools').select('*').eq('admin_id', adminId).single();
    if (error || !data) return null;
    const s = data as any;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      contactEmail: s.contact_email,
      contactPhone: s.contact_phone,
      adminId: s.admin_id,
      subscription: {
        plan: s.subscription_plan,
        startDate: new Date(s.subscription_start),
        endDate: new Date(s.subscription_end),
        maxTeachers: s.max_teachers,
        maxStudents: s.max_students,
        features: s.features,
        price: 0,
      },
      teachers: [],
      students: [],
      createdAt: new Date(s.created_at),
    };
  },

  create: async (school: School): Promise<School> => {
    const { error } = await supabase
      .from('schools')
      .insert({
        id: school.id,
        name: school.name,
        address: school.address,
        contact_email: school.contactEmail,
        contact_phone: school.contactPhone,
        admin_id: school.adminId,
        subscription_plan: school.subscription.plan,
        subscription_start: school.subscription.startDate.toISOString(),
        subscription_end: school.subscription.endDate.toISOString(),
        max_teachers: school.subscription.maxTeachers,
        max_students: school.subscription.maxStudents,
        features: school.subscription.features,
      });
    if (error) throw error;
    return school;
  },

  update: async (id: string, updates: Partial<School>): Promise<School | null> => {
    const { error } = await supabase
      .from('schools')
      .update({
        name: updates.name,
        address: updates.address,
        contact_email: updates.contactEmail,
        contact_phone: updates.contactPhone,
        subscription_plan: updates.subscription?.plan,
        subscription_start: updates.subscription?.startDate?.toISOString(),
        subscription_end: updates.subscription?.endDate?.toISOString(),
        max_teachers: updates.subscription?.maxTeachers,
        max_students: updates.subscription?.maxStudents,
        features: updates.subscription?.features,
      })
      .eq('id', id);
    if (error) return null;
    return schoolDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('schools').delete().eq('id', id);
    return !error;
  },
};

// Teacher Analytics
export const teacherAnalyticsDB = {
  getAnalytics: async (teacherId: string): Promise<TeacherAnalytics> => {
    // Get all tests by teacher
    const tests = await testDB.getByTeacher(teacherId);
    const testIds = tests.map(t => t.id);
    
    // Get all test results for these tests
    const allAttempts: TestAttempt[] = [];
    for (const testId of testIds) {
      const attempts = await testAttemptDB.getByTest(testId);
      allAttempts.push(...attempts);
    }

    // Get all homework by teacher
    const homework = await homeworkDB.getByTeacher(teacherId);
    const homeworkIds = homework.map(h => h.id);

    // Get all submissions for this homework
    const allSubmissions: HomeworkSubmission[] = [];
    for (const hwId of homeworkIds) {
      const submissions = await homeworkSubmissionDB.getByHomework(hwId);
      allSubmissions.push(...submissions);
    }

    // Calculate unique students
    const studentIds = new Set([
      ...allAttempts.map(a => a.studentId),
      ...allSubmissions.map(s => s.studentId),
    ]);

    // Calculate average score
    const averageScore = allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length
      : 0;

    // Get student performance
    const studentPerformance = await Promise.all(
      Array.from(studentIds).map(async (studentId) => {
        const student = await userDB.getById(studentId);
        const studentAttempts = allAttempts.filter(a => a.studentId === studentId);
        const studentSubmissions = allSubmissions.filter(s => s.studentId === studentId);
        
        return {
          studentId,
          name: student?.name || 'Unknown',
          testsTaken: studentAttempts.length,
          averageScore: studentAttempts.length > 0
            ? studentAttempts.reduce((sum, a) => sum + a.percentage, 0) / studentAttempts.length
            : 0,
          homeworkSubmitted: studentSubmissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
          homeworkLate: studentSubmissions.filter(s => s.status === 'late').length,
        };
      })
    );

    // Get test performance
    const testPerformance = tests.map(test => {
      const attempts = allAttempts.filter(a => a.testId === test.id);
      return {
        testId: test.id,
        testName: test.title,
        totalAttempts: attempts.length,
        averageScore: attempts.length > 0
          ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
          : 0,
        passRate: attempts.length > 0
          ? (attempts.filter(a => a.isPassed).length / attempts.length) * 100
          : 0,
      };
    });

    return {
      teacherId,
      totalStudents: studentIds.size,
      totalTests: tests.length,
      totalHomework: homework.length,
      averageScore,
      studentPerformance,
      testPerformance,
    };
  },
};

// File Storage Operations
export const storageDB = {
  uploadFile: async (bucket: string, path: string, file: File): Promise<string | null> => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  },

  deleteFile: async (bucket: string, path: string): Promise<boolean> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  },

  getPublicUrl: (bucket: string, path: string): string => {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },
};

// Voice Practice Operations
export const voicePracticeDB = {
  getByStudent: async (studentId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('voice_practice')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map((v: any) => ({
      id: v.id,
      studentId: v.student_id,
      questionId: v.question_id,
      question: v.question,
      recordedAnswer: v.recorded_answer,
      score: v.score,
      feedback: v.feedback,
      practicedAt: new Date(v.practiced_at),
    }));
  },

  create: async (practice: any): Promise<any> => {
    const { error } = await supabase
      .from('voice_practice')
      .insert({
        id: practice.id,
        student_id: practice.studentId,
        question_id: practice.questionId,
        question: practice.question,
        recorded_answer: practice.recordedAnswer,
        score: practice.score,
        feedback: practice.feedback,
        practiced_at: practice.practicedAt.toISOString(),
      });
    if (error) throw error;
    return practice;
  },
};

// Student Test Attempts - getStudentTestAttempts (extra method from database.ts)
// Already covered by testAttemptDB above, adding as helper
export const getStudentTestAttempts = async (studentId: string, testId: string): Promise<TestAttempt[]> => {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('student_id', studentId)
    .eq('test_id', testId);
  if (error) throw error;
  return (data || []).map((t: any) => ({
    id: t.id,
    testId: t.test_id,
    studentId: t.student_id,
    answers: t.answers,
    score: t.score,
    totalMarks: t.total_marks,
    percentage: t.percentage,
    timeTaken: t.time_taken,
    completedAt: new Date(t.completed_at),
    isPassed: t.is_passed,
  }));
};

// Student Progress Operations
export const progressDB = {
  getAll: async (): Promise<StudentProgress[]> => {
    const { data, error } = await supabase.from('student_progress').select('*');
    if (error) throw error;
    return (data || []).map((p: any) => ({
      studentId: p.student_id,
      subjectId: p.subject_id,
      chapterId: p.chapter_id,
      completed: p.completed,
      mcqScore: p.mcq_score,
      timeSpent: p.time_spent,
      lastAccessed: new Date(p.last_accessed),
    }));
  },

  getByStudent: async (studentId: string): Promise<StudentProgress[]> => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      studentId: p.student_id,
      subjectId: p.subject_id,
      chapterId: p.chapter_id,
      completed: p.completed,
      mcqScore: p.mcq_score,
      timeSpent: p.time_spent,
      lastAccessed: new Date(p.last_accessed),
    }));
  },

  getByStudentAndSubject: async (studentId: string, subjectId: string): Promise<StudentProgress[]> => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      studentId: p.student_id,
      subjectId: p.subject_id,
      chapterId: p.chapter_id,
      completed: p.completed,
      mcqScore: p.mcq_score,
      timeSpent: p.time_spent,
      lastAccessed: new Date(p.last_accessed),
    }));
  },

  getByStudentAndChapter: async (studentId: string, chapterId: string): Promise<StudentProgress | null> => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('chapter_id', chapterId)
      .single();
    if (error || !data) return null;
    const p = data as any;
    return {
      studentId: p.student_id,
      subjectId: p.subject_id,
      chapterId: p.chapter_id,
      completed: p.completed,
      mcqScore: p.mcq_score,
      timeSpent: p.time_spent,
      lastAccessed: new Date(p.last_accessed),
    };
  },

  create: async (progress: StudentProgress): Promise<StudentProgress> => {
    const { error } = await supabase.from('student_progress').insert({
      student_id: progress.studentId,
      subject_id: progress.subjectId,
      chapter_id: progress.chapterId,
      completed: progress.completed,
      mcq_score: progress.mcqScore,
      time_spent: progress.timeSpent,
      last_accessed: progress.lastAccessed.toISOString(),
    });
    if (error) throw error;
    return progress;
  },

  update: async (studentId: string, chapterId: string, updates: Partial<StudentProgress>): Promise<StudentProgress | null> => {
    // Upsert: insert or update
    const existing = await progressDB.getByStudentAndChapter(studentId, chapterId);
    if (!existing) {
      // Need subjectId to create, fallback gracefully
      if (updates.subjectId) {
        return progressDB.create({
          studentId,
          chapterId,
          subjectId: updates.subjectId,
          completed: updates.completed ?? false,
          mcqScore: updates.mcqScore ?? 0,
          timeSpent: updates.timeSpent ?? 0,
          lastAccessed: updates.lastAccessed ?? new Date(),
        });
      }
      return null;
    }
    const { error } = await supabase
      .from('student_progress')
      .update({
        completed: updates.completed,
        mcq_score: updates.mcqScore,
        time_spent: updates.timeSpent,
        last_accessed: updates.lastAccessed?.toISOString() ?? new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('chapter_id', chapterId);
    if (error) return null;
    return progressDB.getByStudentAndChapter(studentId, chapterId);
  },
};

// Study Plan Operations
export const studyPlanDB = {
  getAll: async (): Promise<StudyPlan[]> => {
    const { data, error } = await supabase.from('study_plans').select('*');
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      studentId: p.student_id,
      title: p.title,
      description: p.description,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      dailyGoals: p.daily_goals,
      subjects: p.subjects,
      totalHours: p.total_hours,
      isActive: p.is_active,
      createdAt: new Date(p.created_at),
    }));
  },

  getById: async (id: string): Promise<StudyPlan | null> => {
    const { data, error } = await supabase.from('study_plans').select('*').eq('id', id).single();
    if (error || !data) return null;
    const p = data as any;
    return {
      id: p.id,
      studentId: p.student_id,
      title: p.title,
      description: p.description,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      dailyGoals: p.daily_goals,
      subjects: p.subjects,
      totalHours: p.total_hours,
      isActive: p.is_active,
      createdAt: new Date(p.created_at),
    };
  },

  getByStudent: async (studentId: string): Promise<StudyPlan[]> => {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      studentId: p.student_id,
      title: p.title,
      description: p.description,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      dailyGoals: p.daily_goals,
      subjects: p.subjects,
      totalHours: p.total_hours,
      isActive: p.is_active,
      createdAt: new Date(p.created_at),
    }));
  },

  getActivePlan: async (studentId: string): Promise<StudyPlan | null> => {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .single();
    if (error || !data) return null;
    const p = data as any;
    return {
      id: p.id,
      studentId: p.student_id,
      title: p.title,
      description: p.description,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      dailyGoals: p.daily_goals,
      subjects: p.subjects,
      totalHours: p.total_hours,
      isActive: p.is_active,
      createdAt: new Date(p.created_at),
    };
  },

  create: async (plan: StudyPlan): Promise<StudyPlan> => {
    const { error } = await supabase.from('study_plans').insert({
      id: plan.id,
      student_id: plan.studentId,
      title: plan.title,
      description: plan.description,
      start_date: plan.startDate.toISOString(),
      end_date: plan.endDate.toISOString(),
      daily_goals: plan.dailyGoals,
      subjects: plan.subjects,
      total_hours: plan.totalHours,
      is_active: plan.isActive,
    });
    if (error) throw error;
    return plan;
  },

  update: async (id: string, updates: Partial<StudyPlan>): Promise<StudyPlan | null> => {
    const { error } = await supabase
      .from('study_plans')
      .update({
        title: updates.title,
        description: updates.description,
        start_date: updates.startDate?.toISOString(),
        end_date: updates.endDate?.toISOString(),
        daily_goals: updates.dailyGoals,
        subjects: updates.subjects,
        total_hours: updates.totalHours,
        is_active: updates.isActive,
      })
      .eq('id', id);
    if (error) return null;
    return studyPlanDB.getById(id);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('study_plans').delete().eq('id', id);
    return !error;
  },
};

// Concept Mastery Operations
export const conceptMasteryDB = {
  getAll: async (): Promise<ConceptMastery[]> => {
    const { data, error } = await supabase.from('concept_mastery').select('*');
    if (error) throw error;
    return (data || []).map((m: any) => ({
      studentId: m.student_id,
      subjectId: m.subject_id,
      chapterId: m.chapter_id,
      conceptName: m.concept_name,
      masteryLevel: m.mastery_level,
      attempts: m.attempts,
      correctAttempts: m.correct_attempts,
      lastPracticed: new Date(m.last_practiced),
    }));
  },

  getByStudent: async (studentId: string): Promise<ConceptMastery[]> => {
    const { data, error } = await supabase
      .from('concept_mastery')
      .select('*')
      .eq('student_id', studentId);
    if (error) throw error;
    return (data || []).map((m: any) => ({
      studentId: m.student_id,
      subjectId: m.subject_id,
      chapterId: m.chapter_id,
      conceptName: m.concept_name,
      masteryLevel: m.mastery_level,
      attempts: m.attempts,
      correctAttempts: m.correct_attempts,
      lastPracticed: new Date(m.last_practiced),
    }));
  },

  getByStudentAndSubject: async (studentId: string, subjectId: string): Promise<ConceptMastery[]> => {
    const { data, error } = await supabase
      .from('concept_mastery')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId);
    if (error) throw error;
    return (data || []).map((m: any) => ({
      studentId: m.student_id,
      subjectId: m.subject_id,
      chapterId: m.chapter_id,
      conceptName: m.concept_name,
      masteryLevel: m.mastery_level,
      attempts: m.attempts,
      correctAttempts: m.correct_attempts,
      lastPracticed: new Date(m.last_practiced),
    }));
  },

  update: async (
    studentId: string,
    subjectId: string,
    chapterId: string,
    conceptName: string,
    isCorrect: boolean
  ): Promise<ConceptMastery | null> => {
    // Check existing
    const { data: existing } = await supabase
      .from('concept_mastery')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .eq('chapter_id', chapterId)
      .eq('concept_name', conceptName)
      .single();

    if (!existing) {
      const newMastery = {
        student_id: studentId,
        subject_id: subjectId,
        chapter_id: chapterId,
        concept_name: conceptName,
        mastery_level: isCorrect ? 20 : 0,
        attempts: 1,
        correct_attempts: isCorrect ? 1 : 0,
        last_practiced: new Date().toISOString(),
      };
      const { error } = await supabase.from('concept_mastery').insert(newMastery);
      if (error) return null;
    } else {
      const m = existing as any;
      const newAttempts = m.attempts + 1;
      const newCorrect = m.correct_attempts + (isCorrect ? 1 : 0);
      const newMastery = Math.min(100, (newCorrect / newAttempts) * 100);
      const { error } = await supabase
        .from('concept_mastery')
        .update({
          attempts: newAttempts,
          correct_attempts: newCorrect,
          mastery_level: newMastery,
          last_practiced: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .eq('subject_id', subjectId)
        .eq('chapter_id', chapterId)
        .eq('concept_name', conceptName);
      if (error) return null;
    }

    const { data: result } = await supabase
      .from('concept_mastery')
      .select('*')
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .eq('chapter_id', chapterId)
      .eq('concept_name', conceptName)
      .single();
    if (!result) return null;
    const r = result as any;
    return {
      studentId: r.student_id,
      subjectId: r.subject_id,
      chapterId: r.chapter_id,
      conceptName: r.concept_name,
      masteryLevel: r.mastery_level,
      attempts: r.attempts,
      correctAttempts: r.correct_attempts,
      lastPracticed: new Date(r.last_practiced),
    };
  },
};

// Parent-Child Operations
export const parentChildDB = {
  getAll: async (): Promise<ParentChild[]> => {
    const { data, error } = await supabase.from('parent_children').select('*');
    if (error) throw error;
    return (data || []).map((r: any) => ({
      parentId: r.parent_id,
      childId: r.child_id,
      addedAt: new Date(r.added_at),
    }));
  },

  getByParent: async (parentId: string): Promise<ParentChild[]> => {
    const { data, error } = await supabase
      .from('parent_children')
      .select('*')
      .eq('parent_id', parentId);
    if (error) throw error;
    return (data || []).map((r: any) => ({
      parentId: r.parent_id,
      childId: r.child_id,
      addedAt: new Date(r.added_at),
    }));
  },

  getByChild: async (childId: string): Promise<ParentChild | null> => {
    const { data, error } = await supabase
      .from('parent_children')
      .select('*')
      .eq('child_id', childId)
      .single();
    if (error || !data) return null;
    const r = data as any;
    return {
      parentId: r.parent_id,
      childId: r.child_id,
      addedAt: new Date(r.added_at),
    };
  },

  create: async (relation: ParentChild): Promise<ParentChild> => {
    const { error } = await supabase.from('parent_children').insert({
      parent_id: relation.parentId,
      child_id: relation.childId,
      added_at: relation.addedAt.toISOString(),
    });
    if (error) throw error;
    return relation;
  },

  delete: async (parentId: string, childId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('parent_children')
      .delete()
      .eq('parent_id', parentId)
      .eq('child_id', childId);
    return !error;
  },
};

export default {
  userDB,
  subjectDB,
  chapterDB,
  mcqDB,
  testDB,
  testAttemptDB,
  homeworkDB,
  homeworkSubmissionDB,
  gamificationDB,
  studyGroupDB,
  groupMessageDB,
  battleDB,
  tutorMessageDB,
  notificationDB,
  schoolDB,
  teacherAnalyticsDB,
  storageDB,
  voicePracticeDB,
  progressDB,
  studyPlanDB,
  conceptMasteryDB,
  parentChildDB,
};