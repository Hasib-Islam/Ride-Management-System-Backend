import { Request, Response, NextFunction } from 'express';
import { IUser } from '../modules/user/user.interface';

const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No user information.',
      });
    }

    const user = req.user as IUser;

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

export const AuthorizationMiddleware = {
  authorizeRoles,
};
