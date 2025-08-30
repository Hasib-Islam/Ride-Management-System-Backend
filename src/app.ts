import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { envVars } from './app/config/env';
import { AuthRoutes } from './app/modules/auth/auth.route';
import { RideRoutes } from './app/modules/ride/ride.route';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { LocationRoutes } from './app/modules/location/location.route';
import { PaymentRoutes } from './app/modules/payment/payment.route';
import passport from 'passport';
import { AdminRoutes } from './app/modules/admin/admin.route';
import notFound from './app/middlewares/notFound';
import { UploadRoutes } from './app/modules/upload/upload.route';
import { errorLogger, requestLogger } from './app/middlewares/logger';
import {
  apiLimiter,
  authLimiter,
  securityHeaders,
} from './app/middlewares/security';
import { OTPRoutes } from './app/modules/otp/otp.route';
import { UserRoutes } from './app/modules/user/user.route';
import configurePassport from './app/config/passport';
import helmet from 'helmet';

const app = express();

app.use(securityHeaders);
app.use(helmet());
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
configurePassport();
app.use(passport.initialize());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ride Management System API is working!',
  });
});
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/rides', RideRoutes);
app.use('/api/v1/location', LocationRoutes);
app.use('/api/v1/payments', PaymentRoutes);
app.use('/api/v1/admin', AdminRoutes);
app.use('/api/v1/upload', UploadRoutes);
app.use('/api/v1/otp', OTPRoutes);
app.use('/api/v1/user', UserRoutes);

app.use(notFound);

app.use(errorLogger);

app.use(globalErrorHandler);

export default app;
