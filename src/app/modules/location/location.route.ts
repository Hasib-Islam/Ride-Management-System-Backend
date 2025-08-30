import { Router } from 'express';
import { LocationController } from './location.controller';
import { AuthMiddleware } from '../../middlewares/auth';
import { AuthorizationMiddleware } from '../../middlewares/authorize';

const router = Router();

router.post(
  '/driver',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('driver'),
  LocationController.updateDriverLocation
);

router.post(
  '/ride/:rideId',
  AuthMiddleware.authenticate,
  LocationController.updateRideLocation
);

export const LocationRoutes = router;
