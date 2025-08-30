import { Router } from 'express';
import { UserController } from './user.controller';
import { AuthMiddleware } from '../../middlewares/auth';

const router = Router();

router.get('/profile', AuthMiddleware.authenticate, UserController.getProfile);

router.put(
  '/profile',
  AuthMiddleware.authenticate,
  UserController.updateProfile
);

router.patch(
  '/change-password',
  AuthMiddleware.authenticate,
  UserController.changePassword
);

export const UserRoutes = router;
