import { Router } from 'express';
import { AdminController } from './admin.controller';
import { AuthMiddleware } from '../../middlewares/auth';
import { AuthorizationMiddleware } from '../../middlewares/authorize';

const router = Router();

router.get(
  '/dashboard/stats',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('admin'),
  AdminController.getDashboardStats
);

router.get(
  '/dashboard/recent-rides',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('admin'),
  AdminController.getRecentRides
);

router.get(
  '/dashboard/revenue-analytics',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('admin'),
  AdminController.getRevenueAnalytics
);

export const AdminRoutes = router;
