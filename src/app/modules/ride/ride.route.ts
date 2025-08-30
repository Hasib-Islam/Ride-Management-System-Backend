import { Router } from 'express';
import { RideController } from './ride.controller';
import { AuthMiddleware } from '../../middlewares/auth';
import { AuthorizationMiddleware } from '../../middlewares/authorize';
import { RealTimeController } from './realTime.controller';

const router = Router();

router.post(
  '/request',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('rider'),
  RideController.requestRide
);

router.get('/my-rides', AuthMiddleware.authenticate, RideController.getRides);

router.get(
  '/available',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('driver'),
  RideController.getAvailableRides
);

router.patch(
  '/:rideId/accept',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('driver'),
  RideController.acceptRide
);

router.patch(
  '/:rideId/status',
  AuthMiddleware.authenticate,
  RideController.updateRideStatus
);

router.post(
  '/:rideId/real-time-update',
  AuthMiddleware.authenticate,
  RealTimeController.emitRideUpdate
);

export const RideRoutes = router;
