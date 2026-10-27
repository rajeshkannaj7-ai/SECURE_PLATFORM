import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProctoringEventType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'window_blur'
  | 'copy_paste'
  | 'suspicious_key';

export interface IProctoringEvent extends Document {
  attemptId: Types.ObjectId;
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  eventType: ProctoringEventType;
  eventDetails: string;
  warningNumber: number;
  timestamp: Date;
}

const proctoringEventSchema = new Schema<IProctoringEvent>(
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
    eventType: {
      type: String,
      enum: ['tab_switch', 'fullscreen_exit', 'window_blur', 'copy_paste', 'suspicious_key'],
      required: true,
    },
    eventDetails: {
      type: String,
      default: '',
    },
    warningNumber: {
      type: Number,
      default: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ProctoringEvent = mongoose.model<IProctoringEvent>('ProctoringEvent', proctoringEventSchema);
