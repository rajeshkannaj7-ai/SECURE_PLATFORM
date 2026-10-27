import { Response } from 'express';
import { Exam } from '../models/Exam';
import { ExamAttempt } from '../models/ExamAttempt';
import { User } from '../models/User';
import { ProctoringEvent } from '../models/ProctoringEvent';
import { AuthRequest } from '../middleware/auth';

export const getFacultyAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let examQuery: any = {};
    if (req.user?.role === 'faculty') {
      examQuery.faculty = req.user._id;
    }

    const exams = await Exam.find(examQuery);
    const examIds = exams.map((e) => e._id);

    const attempts = await ExamAttempt.find({
      examId: { $in: examIds },
      status: { $in: ['submitted', 'evaluated'] },
    }).populate('studentId', 'name email studentId department');

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalExams = exams.length;
    const totalAttempts = attempts.length;

    let totalScoreSum = 0;
    let highestScore = 0;
    let lowestScore = attempts.length > 0 ? 100 : 0;
    let passCount = 0;

    const examStatsMap: { [key: string]: { title: string; attempts: number; totalPct: number; passed: number } } = {};
    const subjectStatsMap: { [key: string]: { subject: string; attempts: number; totalPct: number; passed: number } } = {};

    exams.forEach((ex) => {
      examStatsMap[ex._id.toString()] = {
        title: ex.title,
        attempts: 0,
        totalPct: 0,
        passed: 0,
      };
      if (!subjectStatsMap[ex.subject]) {
        subjectStatsMap[ex.subject] = {
          subject: ex.subject,
          attempts: 0,
          totalPct: 0,
          passed: 0,
        };
      }
    });

    attempts.forEach((att) => {
      const pct = att.percentage || 0;
      totalScoreSum += pct;
      if (pct > highestScore) highestScore = pct;
      if (pct < lowestScore) lowestScore = pct;
      if (att.passed) passCount++;

      const eId = att.examId.toString();
      if (examStatsMap[eId]) {
        examStatsMap[eId].attempts += 1;
        examStatsMap[eId].totalPct += pct;
        if (att.passed) examStatsMap[eId].passed += 1;
      }

      // Find subject for this attempt
      const foundExam = exams.find((e) => e._id.toString() === eId);
      if (foundExam && subjectStatsMap[foundExam.subject]) {
        subjectStatsMap[foundExam.subject].attempts += 1;
        subjectStatsMap[foundExam.subject].totalPct += pct;
        if (att.passed) subjectStatsMap[foundExam.subject].passed += 1;
      }
    });

    const averageScore = totalAttempts > 0 ? Number((totalScoreSum / totalAttempts).toFixed(1)) : 0;
    const passPercentage = totalAttempts > 0 ? Number(((passCount / totalAttempts) * 100).toFixed(1)) : 0;

    const examWisePerformance = Object.values(examStatsMap).map((e) => ({
      title: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
      attempts: e.attempts,
      averageScore: e.attempts > 0 ? Number((e.totalPct / e.attempts).toFixed(1)) : 0,
      passRate: e.attempts > 0 ? Number(((e.passed / e.attempts) * 100).toFixed(1)) : 0,
    }));

    const subjectWisePerformance = Object.values(subjectStatsMap).map((s) => ({
      subject: s.subject,
      attempts: s.attempts,
      averageScore: s.attempts > 0 ? Number((s.totalPct / s.attempts).toFixed(1)) : 0,
      passRate: s.attempts > 0 ? Number(((s.passed / s.attempts) * 100).toFixed(1)) : 0,
    }));

    // Top & student comparison
    const studentPerformanceComparison = attempts.slice(0, 10).map((att: any) => ({
      studentName: att.studentId?.name || 'Unknown',
      studentId: att.studentId?.studentId || 'N/A',
      score: att.score,
      totalMarks: att.totalMarks,
      percentage: att.percentage,
      passed: att.passed,
      warnings: att.warningCount,
      isFlagged: att.isFlagged,
    }));

    // Total integrity flags
    const flaggedAttemptsCount = await ExamAttempt.countDocuments({
      examId: { $in: examIds },
      isFlagged: true,
    });

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalExams,
        totalAttempts,
        averageScore,
        highestScore: totalAttempts > 0 ? highestScore : 0,
        lowestScore: totalAttempts > 0 ? lowestScore : 0,
        passPercentage,
        flaggedAttemptsCount,
      },
      examWisePerformance,
      subjectWisePerformance,
      studentPerformanceComparison,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching faculty analytics.' });
  }
};

export const getStudentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!._id;

    const attempts = await ExamAttempt.find({
      studentId,
      status: { $in: ['submitted', 'evaluated'] },
    })
      .populate('examId', 'title subject totalMarks passingMarks durationMinutes')
      .sort({ submittedAt: 1 });

    const totalAttempts = attempts.length;
    let totalScoreSum = 0;
    let highestScore = 0;
    let passedCount = 0;

    const performanceHistory: any[] = [];
    const subjectMap: { [key: string]: { subject: string; attempts: number; totalPct: number; passed: number } } = {};

    attempts.forEach((att) => {
      const exam = att.examId as any;
      const pct = att.percentage || 0;
      totalScoreSum += pct;
      if (pct > highestScore) highestScore = pct;
      if (att.passed) passedCount++;

      performanceHistory.push({
        examTitle: exam?.title || 'Exam',
        date: att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'N/A',
        percentage: pct,
        score: att.score,
        totalMarks: att.totalMarks,
        passed: att.passed,
      });

      const subject = exam?.subject || 'General';
      if (!subjectMap[subject]) {
        subjectMap[subject] = { subject, attempts: 0, totalPct: 0, passed: 0 };
      }
      subjectMap[subject].attempts += 1;
      subjectMap[subject].totalPct += pct;
      if (att.passed) subjectMap[subject].passed += 1;
    });

    const averageScore = totalAttempts > 0 ? Number((totalScoreSum / totalAttempts).toFixed(1)) : 0;
    const passRate = totalAttempts > 0 ? Number(((passedCount / totalAttempts) * 100).toFixed(1)) : 0;

    const subjectProgress = Object.values(subjectMap).map((s) => ({
      subject: s.subject,
      attempts: s.attempts,
      averageScore: Number((s.totalPct / s.attempts).toFixed(1)),
      passRate: Number(((s.passed / s.attempts) * 100).toFixed(1)),
    }));

    res.json({
      success: true,
      stats: {
        totalAttempts,
        passedCount,
        failedCount: totalAttempts - passedCount,
        averageScore,
        highestScore,
        passRate,
      },
      performanceHistory,
      subjectProgress,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching student analytics.' });
  }
};

export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalExams = await Exam.countDocuments();
    const totalAttempts = await ExamAttempt.countDocuments({ status: { $in: ['submitted', 'evaluated'] } });
    const flaggedAttempts = await ExamAttempt.countDocuments({ isFlagged: true });
    const totalProctoringEvents = await ProctoringEvent.countDocuments();

    // Event type distribution
    const eventBreakdown = await ProctoringEvent.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]);

    // Pass rate
    const passedAttempts = await ExamAttempt.countDocuments({ passed: true });
    const overallPassRate = totalAttempts > 0 ? Number(((passedAttempts / totalAttempts) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFaculty,
        totalStudents,
        totalExams,
        totalAttempts,
        flaggedAttempts,
        totalProctoringEvents,
        overallPassRate,
      },
      eventBreakdown: eventBreakdown.map((e) => ({
        type: e._id,
        count: e.count,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching admin analytics.' });
  }
};
