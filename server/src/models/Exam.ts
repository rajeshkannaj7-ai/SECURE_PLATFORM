import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProctoringConfig {
  enforceFullscreen: boolean;
  detectTabSwitch: boolean;
  detectCopyPaste: boolean;
  detectWindowBlur: boolean;
  maxWarnings: number;
}

export interface IExam extends Document {
  title: string;
  description: string;
  subject: string;
  faculty: Types.ObjectId;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startTime: Date;
  endTime: Date;
  instructions: string[];
  isPublished: boolean;
  shuffleQuestions: boolean;
  proctoringConfig: IProctoringConfig;
  questionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: true,
      default: 40,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead default
    },
    instructions: {
      type: [String],
      default: [
        'Ensure you have a stable internet connection.',
        'Fullscreen mode is mandatory during the exam.',
        'Switching tabs, minimizing the browser, or leaving fullscreen will generate proctoring warnings.',
        'Copying and pasting inside the examination interface is strictly restricted.',
        'Submit your exam before the countdown reaches zero.'
      ],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    proctoringConfig: {
      enforceFullscreen: { type: Boolean, default: true },
      detectTabSwitch: { type: Boolean, default: true },
      detectCopyPaste: { type: Boolean, default: true },
      detectWindowBlur: { type: Boolean, default: true },
      maxWarnings: { type: Number, default: 5 },
    },
    questionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = mongoose.model<IExam>('Exam', examSchema);
