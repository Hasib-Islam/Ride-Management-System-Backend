import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '../../middlewares/auth';
import { AuthorizationMiddleware } from '../../middlewares/authorize';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from './auth.validation';
import passport from 'passport';
import { envVars } from '../../config/env';
import { IUser } from '../user/user.interface';
import { createTokens } from '../../utils/tokenUtils';
import { authLimiter } from '../../middlewares/rateLimit';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  AuthController.refreshToken
);

router.post('/logout', AuthController.logout);

router.get('/profile', AuthMiddleware.authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to protected route',
    data: {
      user: req.user,
    },
  });
});

router.get(
  '/admin-only',
  AuthMiddleware.authenticate,
  AuthorizationMiddleware.authorizeRoles('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Access granted to admin route',
      data: {
        user: req.user,
      },
    });
  }
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${envVars.FRONTEND_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const tokens = createTokens(req.user as IUser);

    res.redirect(
      `${envVars.FRONTEND_URL}/auth/success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
    );
  }
);

export const AuthRoutes = router;
