import mongoose, { Document, Schema, Types } from 'mongoose';

export type QuestionType = 'mcq' | 'true_false' | 'short_answer';

export interface IQuestion extends Document {
  examId: Types.ObjectId;
  questionText: string;
  questionType: QuestionType;
  options: string[]; // For MCQ: [A, B, C, D]
  correctAnswer: string; // For MCQ: correct option text; For true_false: "true" | "false"; For short_answer: reference answer
  evaluationGuidelines?: string;
  marks: number;
  explanation?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    questionType: {
      type: String,
      enum: ['mcq', 'true_false', 'short_answer'],
      required: true,
      default: 'mcq',
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer / reference answer is required'],
      trim: true,
    },
    evaluationGuidelines: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    explanation: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
