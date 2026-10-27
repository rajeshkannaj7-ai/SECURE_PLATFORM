import { Router } from 'express';
import {
  logProctoringEvent,
  getAttemptProctoringEvents,
  getFlaggedAttempts,
} from '../controllers/proctoringController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Student logging integrity events
router.post('/log/:attemptId', authorize('student'), logProctoringEvent);

// Faculty & Admin inspecting
router.get('/attempt/:attemptId', authorize('faculty', 'admin'), getAttemptProctoringEvents);
router.get('/flagged', authorize('faculty', 'admin'), getFlaggedAttempts);

export default router;
