import { Router } from 'express';
import {
  addQuestion,
  getExamQuestions,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Questions for an exam
router.get('/exam/:examId', getExamQuestions);

// Faculty & Admin only
router.post('/exam/:examId', authorize('admin', 'faculty'), addQuestion);
router.put('/:id', authorize('admin', 'faculty'), updateQuestion);
router.delete('/:id', authorize('admin', 'faculty'), deleteQuestion);

export default router;
