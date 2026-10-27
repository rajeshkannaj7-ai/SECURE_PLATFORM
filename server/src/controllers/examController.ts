import { Response } from 'express';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { ExamAttempt } from '../models/ExamAttempt';
import { AuthRequest } from '../middleware/auth';

export const createExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      subject,
      durationMinutes,
      totalMarks,
      passingMarks,
      startTime,
      endTime,
      instructions,
      shuffleQuestions,
      proctoringConfig,
    } = req.body;

    if (!title || !subject || !durationMinutes) {
      res.status(400).json({ success: false, message: 'Title, subject, and duration are required.' });
      return;
    }

    const exam = await Exam.create({
      title,
      description: description || '',
      subject,
      faculty: req.user!._id,
      durationMinutes: Number(durationMinutes),
      totalMarks: Number(totalMarks) || 100,
      passingMarks: Number(passingMarks) || 40,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      instructions: instructions || [
        'Ensure you have a stable internet connection.',
        'Fullscreen mode is mandatory during the exam.',
        'Switching tabs or minimizing the browser will generate proctoring warnings.',
        'Submit before the countdown timer reaches zero.',
      ],
      shuffleQuestions: !!shuffleQuestions,
      proctoringConfig: proctoringConfig || {
        enforceFullscreen: true,
        detectTabSwitch: true,
        detectCopyPaste: true,
        detectWindowBlur: true,
        maxWarnings: 5,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating exam.' });
  }
};

export const getAllExams = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    let query: any = {};

    if (userRole === 'faculty') {
      // Faculty sees their own exams
      query.faculty = req.user!._id;
    } else if (userRole === 'student') {
      // Student sees published exams
      query.isPublished = true;
    }
    // Admin sees all

    const exams = await Exam.find(query)
      .populate('faculty', 'name email department')
      .sort({ createdAt: -1 });

    // If student, check attempt status for each exam
    if (userRole === 'student') {
      const studentAttempts = await ExamAttempt.find({ studentId: req.user!._id });
      const attemptMap = new Map();
      studentAttempts.forEach((att) => {
        attemptMap.set(att.examId.toString(), att);
      });

      const examsWithAttempt = exams.map((exam) => {
        const attempt = attemptMap.get(exam._id.toString());
        return {
          ...exam.toObject(),
          userAttempt: attempt
            ? {
                attemptId: attempt._id,
                status: attempt.status,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                percentage: attempt.percentage,
                passed: attempt.passed,
                submittedAt: attempt.submittedAt,
              }
            : null,
        };
      });

      res.json({
        success: true,
        count: examsWithAttempt.length,
        exams: examsWithAttempt,
      });
      return;
    }

    // For faculty and admin, attach attempt counts
    const examIds = exams.map((e) => e._id);
    const attempts = await ExamAttempt.find({ examId: { $in: examIds } });

    const attemptsCountMap: { [key: string]: number } = {};
    const flaggedCountMap: { [key: string]: number } = {};

    attempts.forEach((a) => {
      const eId = a.examId.toString();
      attemptsCountMap[eId] = (attemptsCountMap[eId] || 0) + 1;
      if (a.isFlagged) {
        flaggedCountMap[eId] = (flaggedCountMap[eId] || 0) + 1;
      }
    });

    const enrichedExams = exams.map((e) => ({
      ...e.toObject(),
      totalAttempts: attemptsCountMap[e._id.toString()] || 0,
      flaggedAttempts: flaggedCountMap[e._id.toString()] || 0,
    }));

    res.json({
      success: true,
      count: enrichedExams.length,
      exams: enrichedExams,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching exams.' });
  }
};

export const getExamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id).populate('faculty', 'name email department');

    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    // Check student access
    if (req.user?.role === 'student') {
      if (!exam.isPublished) {
        res.status(403).json({ success: false, message: 'This exam is not yet published.' });
        return;
      }
      const existingAttempt = await ExamAttempt.findOne({
        examId: exam._id,
        studentId: req.user._id,
      });

      res.json({
        success: true,
        exam,
        attempt: existingAttempt,
      });
      return;
    }

    res.json({
      success: true,
      exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching exam.' });
  }
};

export const updateExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    // Ensure only creator or admin can update
    if (req.user?.role !== 'admin' && exam.faculty.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'You are not authorized to update this exam.' });
      return;
    }

    Object.assign(exam, req.body);
    await exam.save();

    res.json({
      success: true,
      message: 'Exam updated successfully',
      exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating exam.' });
  }
};

export const deleteExam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && exam.faculty.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'You are not authorized to delete this exam.' });
      return;
    }

    await Question.deleteMany({ examId: exam._id });
    await ExamAttempt.deleteMany({ examId: exam._id });
    await Exam.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Exam and associated questions deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting exam.' });
  }
};

export const togglePublish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && exam.faculty.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized.' });
      return;
    }

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.json({
      success: true,
      message: `Exam ${exam.isPublished ? 'published' : 'unpublished'} successfully`,
      exam,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error toggling exam publish status.' });
  }
};
