import { Schema, model } from 'mongoose';
import { IUserDocument, Role } from './user.interface';
import bcrypt from 'bcryptjs';

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function (this: IUserDocument) {
        return this.auths.some((auth) => auth.provider === 'credentials');
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.RIDER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: String,
    auths: [
      {
        provider: {
          type: String,
          enum: ['google', 'credentials'],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
      },
    ],
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    licensePhoto: String,
    vehicleInfo: {
      model: String,
      licensePlate: String,
      color: String,
    },
    vehiclePhotos: [String],
    otp: String,
    otpExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const bcrypt = await import('bcryptjs');
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password as string, saltRounds);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;

  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    throw new Error('Password comparison failed');
  }
};

userSchema.index({ currentLocation: '2dsphere' });

export const User = model<IUserDocument>('User', userSchema);
