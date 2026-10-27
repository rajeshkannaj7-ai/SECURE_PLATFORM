import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
