import { Router } from 'express';
import {
  getFacultyAnalytics,
  getStudentAnalytics,
  getAdminAnalytics,
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/student', authorize('student'), getStudentAnalytics);
router.get('/faculty', authorize('faculty', 'admin'), getFacultyAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

export default router;
