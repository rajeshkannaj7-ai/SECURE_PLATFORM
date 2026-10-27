import { Router } from 'express';
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  togglePublish,
} from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAllExams);
router.get('/:id', getExamById);

// Faculty & Admin only
router.post('/', authorize('admin', 'faculty'), createExam);
router.put('/:id', authorize('admin', 'faculty'), updateExam);
router.delete('/:id', authorize('admin', 'faculty'), deleteExam);
router.patch('/:id/toggle-publish', authorize('admin', 'faculty'), togglePublish);

export default router;
