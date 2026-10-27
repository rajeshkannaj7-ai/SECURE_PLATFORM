import { Router } from 'express';
import {
  startAttempt,
  saveAnswer,
  getAttemptProgress,
  submitAttempt,
  getAttemptResult,
} from '../controllers/attemptController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Student actions
router.post('/start/:examId', authorize('student'), startAttempt);
router.post('/:attemptId/save-answer', authorize('student'), saveAnswer);
router.get('/:attemptId/progress', authorize('student'), getAttemptProgress);
router.post('/:attemptId/submit', authorize('student'), submitAttempt);

// Result access (student, faculty, admin)
router.get('/:attemptId/result', getAttemptResult);

export default router;
