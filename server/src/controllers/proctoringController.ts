import { Response } from 'express';
import { ProctoringEvent } from '../models/ProctoringEvent';
import { ExamAttempt } from '../models/ExamAttempt';
import { Exam } from '../models/Exam';
import { AuthRequest } from '../middleware/auth';

export const logProctoringEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { eventType, eventDetails } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    if (attempt.status !== 'in_progress') {
      res.status(400).json({ success: false, message: 'Attempt is no longer in progress.' });
      return;
    }

    const exam = await Exam.findById(attempt.examId);
    const maxWarnings = exam?.proctoringConfig?.maxWarnings || 5;

    attempt.warningCount += 1;

    // Check if threshold exceeded
    if (attempt.warningCount >= maxWarnings && !attempt.isFlagged) {
      attempt.isFlagged = true;
      attempt.flagReasons.push(
        `Exceeded maximum allowed warnings (${maxWarnings}) with event: ${eventType}`
      );
    } else if (eventType === 'copy_paste' && !attempt.flagReasons.includes('Attempted copy-paste operation')) {
      attempt.flagReasons.push('Attempted copy-paste operation');
    }

    await attempt.save();

    const proctoringEvent = await ProctoringEvent.create({
      attemptId,
      examId: attempt.examId,
      studentId: req.user!._id,
      eventType,
      eventDetails: eventDetails || `${eventType} detected by browser monitoring`,
      warningNumber: attempt.warningCount,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Proctoring event logged',
      warningCount: attempt.warningCount,
      maxWarnings,
      isFlagged: attempt.isFlagged,
      event: proctoringEvent,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error logging proctoring event.' });
  }
};

export const getAttemptProctoringEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate('studentId', 'name email studentId')
      .populate('examId', 'title subject proctoringConfig');

    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    const events = await ProctoringEvent.find({ attemptId }).sort({ timestamp: 1 });

    res.json({
      success: true,
      attempt,
      events,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching proctoring events.' });
  }
};

export const getFlaggedAttempts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let examFilter: any = {};
    if (req.user?.role === 'faculty') {
      examFilter.faculty = req.user._id;
    }

    const facultyExams = await Exam.find(examFilter).select('_id');
    const examIds = facultyExams.map((e) => e._id);

    const flaggedAttempts = await ExamAttempt.find({
      examId: { $in: examIds },
      $or: [{ isFlagged: true }, { warningCount: { $gt: 0 } }],
    })
      .populate('studentId', 'name email studentId department')
      .populate('examId', 'title subject totalMarks passingMarks durationMinutes')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: flaggedAttempts.length,
      attempts: flaggedAttempts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching flagged attempts.' });
  }
};
