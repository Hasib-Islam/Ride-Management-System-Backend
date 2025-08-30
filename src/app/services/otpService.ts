import { redisService } from '../config/redis.config';
import { EmailService } from './emailService';

export const OTPService = {
  async generateOTP(email: string): Promise<string> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresIn = parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60;

      await redisService.set(`otp:${email}`, { otp, email }, expiresIn);

      await EmailService.sendOTP(email, otp);

      return otp;
    } catch {
      throw new Error('Failed to generate and send OTP');
    }
  },

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    try {
      const storedData = await redisService.get(`otp:${email}`);

      if (!storedData) {
        return false;
      }

      if (storedData.otp !== otp) {
        return false;
      }

      await redisService.del(`otp:${email}`);

      return true;
    } catch {
      return false;
    }
  },

  async resendOTP(email: string): Promise<string> {
    try {
      return await OTPService.generateOTP(email);
    } catch {
      throw new Error('Failed to resend OTP');
    }
  },
};
