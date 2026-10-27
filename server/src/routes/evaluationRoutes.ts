import { Router } from 'express';
import {
  getPendingEvaluations,
  getAttemptForEvaluation,
  gradeSubjectiveAnswer,
} from '../controllers/evaluationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('faculty', 'admin'));

router.get('/pending', getPendingEvaluations);
router.get('/attempt/:attemptId', getAttemptForEvaluation);
router.post('/grade/:attemptId/:questionId', gradeSubjectiveAnswer);

export default router;
