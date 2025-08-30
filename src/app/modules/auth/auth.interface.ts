import { JwtPayload } from 'jsonwebtoken';

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  role: 'rider' | 'driver' | 'admin';
  phone?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IDecodedToken extends JwtPayload {
  userId: string;
  role: string;
}
