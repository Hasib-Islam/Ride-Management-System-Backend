import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envVars } from '../config/env';
import { User } from '../modules/user/user.model';
import { IDecodedToken } from '../modules/auth/auth.interface';

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = jwt.verify(
      token,
      envVars.JWT_ACCESS_SECRET
    ) as IDecodedToken;

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    (req as any).user = user;

    next();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid token';

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const AuthMiddleware = {
  authenticate,
};
