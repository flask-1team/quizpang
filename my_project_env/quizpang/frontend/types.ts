export type Page =
  | 'home'
  | 'keyFeatures'
  | 'quizCategories'
  | 'projectGoals'
  | 'login'
  | 'signup'
  | 'quizCreation'
  | 'quizList'
  | 'quizGame'
  | 'ranking'
  | 'history';

export type QuizMode = 'exam' | 'study';

export type TimerMode = 'per-question' | 'total';

export interface TimerConfig {
  mode: TimerMode;
  duration: number; // in seconds for 'total', or seconds per question for 'per-question'
}

export type QuestionType = 'multiple' | 'subjective' | 'ox';

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correct_answer: string;
  image_url?: string;
  explanation?: string;
  votes_avg: number;
  votes_count: number;
}

export interface Quiz {
  quiz_id: number;
  title: string;
  category: string;
  creator_id: string;
  votes_avg: number;
  votes_count: number;
  questions_count: number;
}

export interface User {
  id: string;
  username: string;
}

export interface QuizAttempt {
  attemptId: number;
  quizId: number;
  userId: string;
  score: number;
  totalQuestions: number;
  date: number; // timestamp
  mode: QuizMode;
}
