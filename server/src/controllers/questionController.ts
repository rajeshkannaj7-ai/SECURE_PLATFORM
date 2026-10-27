import { Response } from 'express';
import { Question } from '../models/Question';
import { Exam } from '../models/Exam';
import { AuthRequest } from '../middleware/auth';

export const addQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      evaluationGuidelines,
      marks,
      explanation,
    } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && exam.faculty.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to add questions to this exam.' });
      return;
    }

    if (!questionText || !questionType || correctAnswer === undefined) {
      res.status(400).json({ success: false, message: 'Question text, type, and correct answer are required.' });
      return;
    }

    const currentCount = await Question.countDocuments({ examId });

    const question = await Question.create({
      examId,
      questionText,
      questionType,
      options: questionType === 'mcq' ? options || [] : [],
      correctAnswer: String(correctAnswer).trim(),
      evaluationGuidelines: evaluationGuidelines || '',
      marks: Number(marks) || 1,
      explanation: explanation || '',
      order: currentCount + 1,
    });

    // Update exam total marks and count
    const allQuestions = await Question.find({ examId });
    const totalMarks = allQuestions.reduce((acc, q) => acc + q.marks, 0);
    exam.questionsCount = allQuestions.length;
    exam.totalMarks = totalMarks;
    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      question,
      examTotalMarks: exam.totalMarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error adding question.' });
  }
};

export const getExamQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Exam not found.' });
      return;
    }

    const isStudent = req.user?.role === 'student';

    // If student, hide correct answers and explanations!
    let projection = {};
    if (isStudent) {
      projection = { correctAnswer: 0, evaluationGuidelines: 0, explanation: 0 };
    }

    let questions = await Question.find({ examId }, projection).sort({ order: 1 });

    if (isStudent && exam.shuffleQuestions) {
      // Fisher-Yates shuffle
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching questions.' });
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const exam = await Exam.findById(question.examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Associated exam not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && exam.faculty.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this question.' });
      return;
    }

    Object.assign(question, req.body);
    await question.save();

    // Recalculate total marks
    const allQuestions = await Question.find({ examId: question.examId });
    const totalMarks = allQuestions.reduce((acc, q) => acc + q.marks, 0);
    exam.totalMarks = totalMarks;
    exam.questionsCount = allQuestions.length;
    await exam.save();

    res.json({
      success: true,
      message: 'Question updated successfully',
      question,
      examTotalMarks: exam.totalMarks,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating question.' });
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const exam = await Exam.findById(question.examId);
    if (!exam) {
      res.status(404).json({ success: false, message: 'Associated exam not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && exam.faculty.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this question.' });
      return;
    }

    const examId = question.examId;
    await Question.findByIdAndDelete(id);

    // Recalculate
    const remainingQuestions = await Question.find({ examId });
    exam.totalMarks = remainingQuestions.reduce((acc, q) => acc + q.marks, 0);
    exam.questionsCount = remainingQuestions.length;
    await exam.save();

    res.json({
      success: true,
      message: 'Question deleted successfully',
      examTotalMarks: exam.totalMarks,
      questionsCount: exam.questionsCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting question.' });
  }
};
