import { Response } from 'express';
import { ExamAttempt } from '../models/ExamAttempt';
import { Answer } from '../models/Answer';
import { Question } from '../models/Question';
import { Exam } from '../models/Exam';
import { AuthRequest } from '../middleware/auth';

export const getPendingEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let examQuery: any = {};
    if (req.user?.role === 'faculty') {
      examQuery.faculty = req.user._id;
    }

    const facultyExams = await Exam.find(examQuery).select('_id title subject totalMarks passingMarks');
    const examIds = facultyExams.map((e) => e._id);

    // Find attempts that have submitted status or pendingEvaluationCount > 0
    const pendingAttempts = await ExamAttempt.find({
      examId: { $in: examIds },
      pendingEvaluationCount: { $gt: 0 },
    })
      .populate('studentId', 'name email studentId')
      .populate('examId', 'title subject totalMarks passingMarks durationMinutes')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: pendingAttempts.length,
      attempts: pendingAttempts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching pending evaluations.' });
  }
};

export const getAttemptForEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate('examId')
      .populate('studentId', 'name email studentId department');

    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    const exam = attempt.examId as any;
    if (
      req.user?.role !== 'admin' &&
      exam.faculty.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Not authorized to evaluate this attempt.' });
      return;
    }

    const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });
    const answers = await Answer.find({ attemptId });

    const answerMap = new Map();
    answers.forEach((ans) => {
      answerMap.set(ans.questionId.toString(), ans);
    });

    const questionsWithAnswers = questions.map((q) => {
      const ans = answerMap.get(q._id.toString());
      return {
        questionId: q._id,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        correctAnswer: q.correctAnswer,
        evaluationGuidelines: q.evaluationGuidelines,
        options: q.options,
        answerId: ans?._id,
        studentAnswer: ans?.studentAnswer || '(Not answered)',
        marksAwarded: ans?.marksAwarded || 0,
        isEvaluated: ans?.isEvaluated || false,
        facultyFeedback: ans?.facultyFeedback || '',
      };
    });

    res.json({
      success: true,
      attempt,
      questionsWithAnswers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error loading attempt for evaluation.' });
  }
};

export const gradeSubjectiveAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId, questionId } = req.params;
    const { marksAwarded, facultyFeedback } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found.' });
      return;
    }

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    if (marksAwarded < 0 || marksAwarded > question.marks) {
      res.status(400).json({
        success: false,
        message: `Marks awarded must be between 0 and maximum marks (${question.marks}).`,
      });
      return;
    }

    let answer = await Answer.findOne({ attemptId, questionId });
    if (!answer) {
      answer = new Answer({
        attemptId,
        examId: attempt.examId,
        studentId: attempt.studentId,
        questionId,
        studentAnswer: '',
      });
    }

    answer.marksAwarded = Number(marksAwarded);
    answer.isEvaluated = true;
    answer.isCorrect = Number(marksAwarded) > 0;
    answer.facultyFeedback = facultyFeedback || '';
    await answer.save();

    // Recalculate full attempt marks
    const allAnswers = await Answer.find({ attemptId });
    const totalScore = allAnswers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);

    const exam = await Exam.findById(attempt.examId);
    const totalMarks = exam?.totalMarks || attempt.totalMarks || 100;
    const passingMarks = exam?.passingMarks || 40;

    const remainingPending = allAnswers.filter((a) => !a.isEvaluated).length;

    attempt.score = totalScore;
    attempt.percentage = totalMarks > 0 ? Number(((totalScore / totalMarks) * 100).toFixed(2)) : 0;
    attempt.passed = totalScore >= passingMarks;
    attempt.pendingEvaluationCount = remainingPending;
    attempt.evaluatedBy = req.user!._id;
    attempt.evaluatedAt = new Date();

    if (remainingPending === 0) {
      attempt.status = 'evaluated';
      attempt.isEvaluated = true;
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Grading updated successfully',
      attempt,
      answer,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error grading answer.' });
  }
};
