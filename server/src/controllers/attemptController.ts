import { Response } from 'express';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { ExamAttempt } from '../models/ExamAttempt';
import { Answer } from '../models/Answer';
import { ProctoringEvent } from '../models/ProctoringEvent';
import { AuthRequest } from '../middleware/auth';

export const startAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const studentId = req.user!._id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    if (!exam.isPublished) {
      res.status(400).json({ success: false, message: 'This exam is not published yet.' });
      return;
    }

    const now = new Date();
    if (exam.endTime && now > new Date(exam.endTime)) {
      res.status(400).json({ success: false, message: 'Exam period has ended. Submissions are closed.' });
      return;
    }

    // Check for existing attempt
    let attempt = await ExamAttempt.findOne({ examId, studentId });

    if (attempt) {
      if (['submitted', 'evaluated', 'disqualified'].includes(attempt.status)) {
        res.status(400).json({
          success: false,
          message: 'You have already submitted this exam.',
          attemptId: attempt._id,
        });
        return;
      }

      // Check if time has already expired on this running attempt
      const elapsedMs = Date.now() - new Date(attempt.startTime).getTime();
      const allowedMs = exam.durationMinutes * 60 * 1000;
      const gracePeriodMs = 60 * 1000; // 1 min buffer

      if (elapsedMs > allowedMs + gracePeriodMs) {
        // Auto-close attempt if student returns after time has expired
        attempt.status = 'submitted';
        attempt.submittedAt = new Date(new Date(attempt.startTime).getTime() + allowedMs);
        await attempt.save();

        res.status(400).json({
          success: false,
          message: 'Your exam time limit has expired.',
          attemptId: attempt._id,
        });
        return;
      }

      const remainingSeconds = Math.max(0, Math.floor((allowedMs - elapsedMs) / 1000));

      res.json({
        success: true,
        message: 'Resuming active exam attempt',
        attempt,
        exam,
        remainingSeconds,
      });
      return;
    }

    // Create new attempt
    const totalQuestions = await Question.countDocuments({ examId });

    attempt = await ExamAttempt.create({
      examId,
      studentId,
      startTime: new Date(),
      status: 'in_progress',
      totalMarks: exam.totalMarks,
      totalQuestions,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Exam attempt started successfully',
      attempt,
      exam,
      remainingSeconds: exam.durationMinutes * 60,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error starting exam attempt.' });
  }
};

export const saveAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { questionId, studentAnswer, isMarkedForReview } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    if (attempt.studentId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to modify this attempt.' });
      return;
    }

    if (attempt.status !== 'in_progress') {
      res.status(400).json({ success: false, message: 'Cannot save answers for an inactive or submitted attempt.' });
      return;
    }

    // Save or update answer
    const answer = await Answer.findOneAndUpdate(
      { attemptId, questionId },
      {
        attemptId,
        examId: attempt.examId,
        studentId: req.user!._id,
        questionId,
        studentAnswer: studentAnswer !== undefined ? String(studentAnswer) : '',
        isMarkedForReview: isMarkedForReview !== undefined ? Boolean(isMarkedForReview) : false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update answered count
    const answeredCount = await Answer.countDocuments({
      attemptId,
      studentAnswer: { $nin: ['', null] },
    });
    attempt.answeredCount = answeredCount;
    await attempt.save();

    res.json({
      success: true,
      message: 'Answer saved',
      answer,
      answeredCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error saving answer.' });
  }
};

export const getAttemptProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const attempt = await ExamAttempt.findById(attemptId).populate('examId');

    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    if (
      req.user?.role === 'student' &&
      attempt.studentId.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized access to this attempt.' });
      return;
    }

    const answers = await Answer.find({ attemptId });
    const exam = attempt.examId as any;

    const elapsedMs = Date.now() - new Date(attempt.startTime).getTime();
    const totalAllowedMs = (exam?.durationMinutes || 60) * 60 * 1000;
    const remainingSeconds = Math.max(0, Math.floor((totalAllowedMs - elapsedMs) / 1000));

    res.json({
      success: true,
      attempt,
      answers,
      remainingSeconds,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching progress.' });
  }
};

export const submitAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    if (attempt.studentId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    if (attempt.status !== 'in_progress') {
      res.status(400).json({ success: false, message: 'This attempt is already submitted.' });
      return;
    }

    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Associated exam not found.' });
      return;
    }

    // Fetch all questions and student's answers
    const questions = await Question.find({ examId: exam._id });
    const studentAnswers = await Answer.find({ attemptId });

    const answerMap = new Map();
    studentAnswers.forEach((ans) => {
      answerMap.set(ans.questionId.toString(), ans);
    });

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let pendingEvaluationCount = 0;
    let answeredCount = 0;

    for (const q of questions) {
      const qId = q._id.toString();
      let ans = answerMap.get(qId);

      const hasAnswer = ans && ans.studentAnswer && ans.studentAnswer.trim() !== '';
      if (hasAnswer) {
        answeredCount++;
      }

      if (q.questionType === 'mcq' || q.questionType === 'true_false') {
        const studentAns = (ans?.studentAnswer || '').trim().toLowerCase();
        const correctAns = q.correctAnswer.trim().toLowerCase();

        const isCorrect = hasAnswer && studentAns === correctAns;
        const marksAwarded = isCorrect ? q.marks : 0;

        if (isCorrect) {
          totalScore += marksAwarded;
          correctCount++;
        } else if (hasAnswer) {
          incorrectCount++;
        }

        if (ans) {
          ans.isCorrect = isCorrect;
          ans.marksAwarded = marksAwarded;
          ans.isEvaluated = true;
          await ans.save();
        } else {
          await Answer.create({
            attemptId,
            examId: exam._id,
            studentId: req.user!._id,
            questionId: q._id,
            studentAnswer: '',
            isCorrect: false,
            marksAwarded: 0,
            isEvaluated: true,
          });
        }
      } else if (q.questionType === 'short_answer') {
        pendingEvaluationCount++;
        if (ans) {
          ans.isEvaluated = false;
          ans.marksAwarded = 0;
          await ans.save();
        } else {
          await Answer.create({
            attemptId,
            examId: exam._id,
            studentId: req.user!._id,
            questionId: q._id,
            studentAnswer: '',
            isEvaluated: false,
            marksAwarded: 0,
          });
        }
      }
    }

    const totalMarks = exam.totalMarks || 100;
    const percentage = totalMarks > 0 ? Number(((totalScore / totalMarks) * 100).toFixed(2)) : 0;
    const passed = totalScore >= exam.passingMarks;

    attempt.submittedAt = new Date();
    attempt.totalMarks = totalMarks;
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.totalQuestions = questions.length;
    attempt.answeredCount = answeredCount;
    attempt.correctCount = correctCount;
    attempt.incorrectCount = incorrectCount;
    attempt.pendingEvaluationCount = pendingEvaluationCount;

    if (pendingEvaluationCount === 0) {
      attempt.status = 'evaluated';
      attempt.isEvaluated = true;
    } else {
      attempt.status = 'submitted';
      attempt.isEvaluated = false;
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Exam submitted successfully.',
      attempt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting exam.' });
  }
};

export const getAttemptResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate('examId')
      .populate('studentId', 'name email department studentId');

    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    // Security check
    if (
      req.user?.role === 'student' &&
      attempt.studentId._id.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this result.' });
      return;
    }

    // Questions and answers
    const questions = await Question.find({ examId: (attempt.examId as any)._id }).sort({ order: 1 });
    const answers = await Answer.find({ attemptId });
    const proctoringEvents = await ProctoringEvent.find({ attemptId }).sort({ timestamp: 1 });

    const answerMap = new Map();
    answers.forEach((ans) => {
      answerMap.set(ans.questionId.toString(), ans);
    });

    const detailedBreakdown = questions.map((q) => {
      const studentAns = answerMap.get(q._id.toString());
      return {
        questionId: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        marks: q.marks,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        studentAnswer: studentAns?.studentAnswer || '(No answer provided)',
        isCorrect: studentAns?.isCorrect,
        marksAwarded: studentAns?.marksAwarded || 0,
        isEvaluated: studentAns?.isEvaluated || false,
        facultyFeedback: studentAns?.facultyFeedback || '',
      };
    });

    res.json({
      success: true,
      attempt,
      breakdown: detailedBreakdown,
      proctoringEvents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching result.' });
  }
};
