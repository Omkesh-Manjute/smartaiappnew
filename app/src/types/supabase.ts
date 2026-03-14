export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'student' | 'teacher' | 'admin' | 'parent';
          avatar: string | null;
          created_at: string;
          is_premium: boolean;
          school_id: string | null;
          grade: number | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'student' | 'teacher' | 'admin' | 'parent';
          avatar?: string | null;
          created_at?: string;
          is_premium?: boolean;
          school_id?: string | null;
          grade?: number | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'student' | 'teacher' | 'admin' | 'parent';
          avatar?: string | null;
          created_at?: string;
          is_premium?: boolean;
          school_id?: string | null;
          grade?: number | null;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          grade: number;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          grade: number;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
          grade?: number;
          created_at?: string;
          created_by?: string | null;
        };
      };
      chapters: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          description: string;
          order: number;
          content: string;
          video_url: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          description: string;
          order: number;
          content: string;
          video_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          description?: string;
          order?: number;
          content?: string;
          video_url?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mcqs: {
        Row: {
          id: string;
          chapter_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          difficulty: 'easy' | 'medium' | 'hard';
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
          difficulty: 'easy' | 'medium' | 'hard';
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          question?: string;
          options?: string[];
          correct_answer?: number;
          explanation?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          created_at?: string;
        };
      };
      homework: {
        Row: {
          id: string;
          title: string;
          description: string;
          subject_id: string;
          chapter_id: string | null;
          teacher_id: string;
          file_url: string | null;
          file_name: string | null;
          due_date: string;
          max_marks: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          subject_id: string;
          chapter_id?: string | null;
          teacher_id: string;
          file_url?: string | null;
          file_name?: string | null;
          due_date: string;
          max_marks: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          subject_id?: string;
          chapter_id?: string | null;
          teacher_id?: string;
          file_url?: string | null;
          file_name?: string | null;
          due_date?: string;
          max_marks?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      homework_submissions: {
        Row: {
          id: string;
          homework_id: string;
          student_id: string;
          file_url: string | null;
          file_name: string | null;
          answer_text: string | null;
          submitted_at: string;
          marks: number | null;
          feedback: string | null;
          status: 'submitted' | 'graded' | 'late';
        };
        Insert: {
          id?: string;
          homework_id: string;
          student_id: string;
          file_url?: string | null;
          file_name?: string | null;
          answer_text?: string | null;
          submitted_at?: string;
          marks?: number | null;
          feedback?: string | null;
          status?: 'submitted' | 'graded' | 'late';
        };
        Update: {
          id?: string;
          homework_id?: string;
          student_id?: string;
          file_url?: string | null;
          file_name?: string | null;
          answer_text?: string | null;
          submitted_at?: string;
          marks?: number | null;
          feedback?: string | null;
          status?: 'submitted' | 'graded' | 'late';
        };
      };
      tests: {
        Row: {
          id: string;
          title: string;
          description: string;
          subject_id: string;
          chapter_ids: string[];
          questions: Json;
          duration: number;
          total_marks: number;
          passing_marks: number;
          created_by: string;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          subject_id: string;
          chapter_ids: string[];
          questions: Json;
          duration: number;
          total_marks: number;
          passing_marks: number;
          created_by: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          subject_id?: string;
          chapter_ids?: string[];
          questions?: Json;
          duration?: number;
          total_marks?: number;
          passing_marks?: number;
          created_by?: string;
          created_at?: string;
          is_active?: boolean;
        };
      };
      test_results: {
        Row: {
          id: string;
          test_id: string;
          student_id: string;
          answers: number[];
          score: number;
          total_marks: number;
          percentage: number;
          time_taken: number;
          completed_at: string;
          is_passed: boolean;
        };
        Insert: {
          id?: string;
          test_id: string;
          student_id: string;
          answers: number[];
          score: number;
          total_marks: number;
          percentage: number;
          time_taken: number;
          completed_at?: string;
          is_passed: boolean;
        };
        Update: {
          id?: string;
          test_id?: string;
          student_id?: string;
          answers?: number[];
          score?: number;
          total_marks?: number;
          percentage?: number;
          time_taken?: number;
          completed_at?: string;
          is_passed?: boolean;
        };
      };
      gamification: {
        Row: {
          student_id: string;
          xp: number;
          level: number;
          streak: number;
          last_study_date: string | null;
          total_study_time: number;
          badges: Json;
          unlocked_avatars: string[];
          unlocked_themes: string[];
          current_avatar: string;
          coins: number;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          xp?: number;
          level?: number;
          streak?: number;
          last_study_date?: string | null;
          total_study_time?: number;
          badges?: Json;
          unlocked_avatars?: string[];
          unlocked_themes?: string[];
          current_avatar?: string;
          coins?: number;
          updated_at?: string;
        };
        Update: {
          student_id?: string;
          xp?: number;
          level?: number;
          streak?: number;
          last_study_date?: string | null;
          total_study_time?: number;
          badges?: Json;
          unlocked_avatars?: string[];
          unlocked_themes?: string[];
          current_avatar?: string;
          coins?: number;
          updated_at?: string;
        };
      };
      study_groups: {
        Row: {
          id: string;
          name: string;
          description: string;
          subject_id: string;
          created_by: string;
          members: Json;
          max_members: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          subject_id: string;
          created_by: string;
          members: Json;
          max_members: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          subject_id?: string;
          created_by?: string;
          members?: Json;
          max_members?: number;
          created_at?: string;
        };
      };
      group_messages: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          message: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          message: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          message?: string;
          sent_at?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          subject_id: string;
          chapter_id: string | null;
          player1_id: string;
          player2_id: string | null;
          player1_score: number;
          player2_score: number;
          player1_answers: number[];
          player2_answers: number[];
          questions: Json;
          status: 'waiting' | 'in_progress' | 'completed';
          winner_id: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          subject_id: string;
          chapter_id?: string | null;
          player1_id: string;
          player2_id?: string | null;
          player1_score?: number;
          player2_score?: number;
          player1_answers?: number[];
          player2_answers?: number[];
          questions: Json;
          status?: 'waiting' | 'in_progress' | 'completed';
          winner_id?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          subject_id?: string;
          chapter_id?: string | null;
          player1_id?: string;
          player2_id?: string | null;
          player1_score?: number;
          player2_score?: number;
          player1_answers?: number[];
          player2_answers?: number[];
          questions?: Json;
          status?: 'waiting' | 'in_progress' | 'completed';
          winner_id?: string | null;
          created_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      tutor_messages: {
        Row: {
          id: string;
          student_id: string;
          message: string;
          response: string;
          subject_id: string | null;
          chapter_id: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          message: string;
          response: string;
          subject_id?: string | null;
          chapter_id?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          message?: string;
          response?: string;
          subject_id?: string | null;
          chapter_id?: string | null;
          sent_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'achievement' | 'reminder' | 'battle' | 'message' | 'system' | 'homework';
          read: boolean;
          created_at: string;
          action_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'achievement' | 'reminder' | 'battle' | 'message' | 'system' | 'homework';
          read?: boolean;
          created_at?: string;
          action_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'achievement' | 'reminder' | 'battle' | 'message' | 'system' | 'homework';
          read?: boolean;
          created_at?: string;
          action_url?: string | null;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          address: string;
          contact_email: string;
          contact_phone: string;
          admin_id: string;
          subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise';
          subscription_start: string;
          subscription_end: string;
          max_teachers: number;
          max_students: number;
          features: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          contact_email: string;
          contact_phone: string;
          admin_id: string;
          subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
          subscription_start?: string;
          subscription_end?: string;
          max_teachers?: number;
          max_students?: number;
          features?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          contact_email?: string;
          contact_phone?: string;
          admin_id?: string;
          subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
          subscription_start?: string;
          subscription_end?: string;
          max_teachers?: number;
          max_students?: number;
          features?: string[];
          created_at?: string;
        };
      };
      parent_children: {
        Row: {
          parent_id: string;
          child_id: string;
          added_at: string;
        };
        Insert: {
          parent_id: string;
          child_id: string;
          added_at?: string;
        };
        Update: {
          parent_id?: string;
          child_id?: string;
          added_at?: string;
        };
      };
      study_plans: {
        Row: {
          id: string;
          student_id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          daily_goals: Json;
          subjects: string[];
          total_hours: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          daily_goals: Json;
          subjects: string[];
          total_hours: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          daily_goals?: Json;
          subjects?: string[];
          total_hours?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      concept_mastery: {
        Row: {
          id: string;
          student_id: string;
          subject_id: string;
          chapter_id: string;
          concept_name: string;
          mastery_level: number;
          attempts: number;
          correct_attempts: number;
          last_practiced: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          subject_id: string;
          chapter_id: string;
          concept_name: string;
          mastery_level?: number;
          attempts?: number;
          correct_attempts?: number;
          last_practiced?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          subject_id?: string;
          chapter_id?: string;
          concept_name?: string;
          mastery_level?: number;
          attempts?: number;
          correct_attempts?: number;
          last_practiced?: string;
        };
      };
      voice_practice: {
        Row: {
          id: string;
          student_id: string;
          question_id: string;
          question: string;
          recorded_answer: string;
          score: number;
          feedback: string;
          practiced_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          question_id: string;
          question: string;
          recorded_answer: string;
          score: number;
          feedback: string;
          practiced_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          question_id?: string;
          question?: string;
          recorded_answer?: string;
          score?: number;
          feedback?: string;
          practiced_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
