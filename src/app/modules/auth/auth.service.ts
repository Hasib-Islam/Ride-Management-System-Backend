import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { envVars } from '../../config/env';
import { User } from '../user/user.model';
import {
  ILoginUser,
  IRegisterUser,
  IAuthTokens,
  IDecodedToken,
} from './auth.interface';
import { IUser } from '../user/user.interface';
import { AppError } from '../../errorHelpers/AppError';

const createTokens = (user: IUser): IAuthTokens => {
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

const registerUser = async (userData: IRegisterUser) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  const hashedPassword = await bcrypt.hash(
    userData.password,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const user = await User.create({
    ...userData,
    password: hashedPassword,
  });

  const userObject = user.toObject() as Partial<IUser>;
  delete userObject.password;

  const tokens = createTokens(user);

  return { user: userObject, tokens };
};

const loginUser = async (loginData: ILoginUser) => {
  const user = await User.findOne({ email: loginData.email }).select(
    '+password'
  );
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.password) {
    throw new AppError('Please use social login for this account', 401);
  }

  const isPasswordValid = await bcrypt.compare(
    loginData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const userObject = user.toObject() as Partial<IUser>;
  delete userObject.password;

  const tokens = createTokens(user);

  return { user: userObject, tokens };
};

const refreshToken = async (refreshTokenString: string) => {
  try {
    const decoded = jwt.verify(
      refreshTokenString,
      envVars.JWT_REFRESH_SECRET
    ) as IDecodedToken;

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tokens = createTokens(user);
    return tokens;
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError('Invalid refresh token: ' + error.message, 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
};
