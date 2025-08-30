import jwt from 'jsonwebtoken';
import { envVars } from '../config/env';
import { IUser } from '../modules/user/user.interface';
import { IAuthTokens } from '../modules/auth/auth.interface';

export const createTokens = (user: IUser): IAuthTokens => {
  const payload = {
    userId: user._id?.toString(),
    role: user.role,
  };

  const accessToken = jwt.sign(payload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: envVars.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, envVars.JWT_REFRESH_SECRET, {
    expiresIn: envVars.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
};
