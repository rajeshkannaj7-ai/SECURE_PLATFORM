import mongoose, { Document, Schema, Types } from 'mongoose';

export type AttemptStatus = 'in_progress' | 'submitted' | 'evaluated' | 'disqualified';

export interface IExamAttempt extends Document {
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  startTime: Date;
  submittedAt?: Date;
  status: AttemptStatus;
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
  evaluatedBy?: Types.ObjectId;
  evaluatedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    submittedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'evaluated', 'disqualified'],
      default: 'in_progress',
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReasons: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    answeredCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    pendingEvaluationCount: {
      type: Number,
      default: 0,
    },
    isEvaluated: {
      type: Boolean,
      default: false,
    },
    facultyNotes: {
      type: String,
      default: '',
    },
    evaluatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    evaluatedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a student cannot have multiple concurrent in_progress attempts
examAttemptSchema.index({ examId: 1, studentId: 1 });

export const ExamAttempt = mongoose.model<IExamAttempt>('ExamAttempt', examAttemptSchema);
