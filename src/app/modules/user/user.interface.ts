import { Types } from 'mongoose';

export enum Role {
  RIDER = 'rider',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export interface IAuthProvider {
  provider: 'google' | 'credentials';
  providerId: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: Role;
  isActive?: boolean;
  isVerified?: boolean;
  auths: IAuthProvider[];
  profilePicture?: string;
  currentLocation?: {
    type: string;
    coordinates: [number, number];
  };
  licensePhoto?: string;
  vehicleInfo?: {
    model: string;
    licensePlate: string;
    color: string;
  };
  vehiclePhotos?: string[];
  otp?: string;
  otpExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
