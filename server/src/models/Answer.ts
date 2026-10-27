import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnswer extends Document {
  attemptId: Types.ObjectId;
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  questionId: Types.ObjectId;
  studentAnswer: string;
  isCorrect?: boolean;
  marksAwarded: number;
  isEvaluated: boolean;
  facultyFeedback?: string;
  isMarkedForReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'ExamAttempt',
      required: true,
      index: true,
    },
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
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    studentAnswer: {
      type: String,
      default: '',
    },
    isCorrect: {
      type: Boolean,
      default: undefined,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    isEvaluated: {
      type: Boolean,
      default: false,
    },
    facultyFeedback: {
      type: String,
      default: '',
    },
    isMarkedForReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);
