export type Role = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  studentId?: string;
  employeeId?: string;
  isActive?: boolean;
}

export type QuestionType = 'mcq' | 'true_false' | 'short_answer';

export interface Question {
  _id: string;
  examId: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer?: string;
  evaluationGuidelines?: string;
  marks: number;
  explanation?: string;
  order: number;
}

export interface ProctoringConfig {
  enforceFullscreen: boolean;
  detectTabSwitch: boolean;
  detectCopyPaste: boolean;
  detectWindowBlur: boolean;
  maxWarnings: number;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  subject: string;
  faculty: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  } | string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string;
  endTime: string;
  instructions: string[];
  isPublished: boolean;
  shuffleQuestions: boolean;
  proctoringConfig: ProctoringConfig;
  questionsCount: number;
  totalAttempts?: number;
  flaggedAttempts?: number;
  userAttempt?: {
    attemptId: string;
    status: 'in_progress' | 'submitted' | 'evaluated' | 'disqualified';
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    submittedAt?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamAttempt {
  _id: string;
  examId: Exam | string;
  studentId: User | string;
  startTime: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'evaluated' | 'disqualified';
  warningCount: number;
  isFlagged: boolean;
  flagReasons: string[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  pendingEvaluationCount: number;
  isEvaluated: boolean;
  facultyNotes?: string;
}

export interface Answer {
  _id?: string;
  attemptId: string;
  questionId: string;
  studentAnswer: string;
  isCorrect?: boolean;
  marksAwarded: number;
  isEvaluated: boolean;
  facultyFeedback?: string;
  isMarkedForReview: boolean;
}

export interface ProctoringEvent {
  _id: string;
  attemptId: string;
  examId: string;
  studentId: string;
  eventType: 'tab_switch' | 'fullscreen_exit' | 'window_blur' | 'copy_paste' | 'suspicious_key';
  eventDetails: string;
  warningNumber: number;
  timestamp: string;
}
