import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { AuthMiddleware } from '../../middlewares/auth';
import { AuthorizationMiddleware } from '../../middlewares/authorize';

const router = Router();

router.post(
  '/initiate',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('rider'),
  PaymentController.initiatePayment
);

router.post('/ipn-listener', PaymentController.handleIPN);

router.get(
  '/status/:tran_id',
  AuthMiddleware.authenticate,
  PaymentController.checkPaymentStatus
);

router.get(
  '/my-payments',
  AuthMiddleware.authenticate,
  PaymentController.getMyPayments
);

export const PaymentRoutes = router;
