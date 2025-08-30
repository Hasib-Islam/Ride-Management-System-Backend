import nodemailer from 'nodemailer';
import { envVars } from '../config/env';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: envVars.SMTP_HOST,
    port: Number(envVars.SMTP_PORT),
    secure: Number(envVars.SMTP_PORT) === 465,
    auth: {
      user: envVars.SMTP_USER,
      pass: envVars.SMTP_PASS,
    },
  });
};

let transporter = createTransporter();

transporter.verify((error) => {
  if (error) {
    transporter = createTransporter();
  }
});

export const EmailService = {
  sendOTP: async (
    email: string,
    otp: string
  ): Promise<nodemailer.SentMessageInfo> => {
    try {
      const mailOptions = {
        from: envVars.SMTP_FROM,
        to: email,
        subject: 'Your OTP Code - Ride Management System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3366cc;">Ride Management System</h2>
            <p>Your OTP code is:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch {
      transporter = createTransporter();

      throw new Error('Failed to send OTP email. Please try again later.');
    }
  },
};
