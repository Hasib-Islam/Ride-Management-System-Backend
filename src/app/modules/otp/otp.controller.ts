import { Request, Response } from 'express';
import { OTPService } from '../../services/otpService';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { User } from '../user/user.model';

const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Email is required',
        data: null,
      });
    }

    await OTPService.generateOTP(email);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'OTP sent successfully',
      data: null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send OTP';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Email and OTP are required',
        data: null,
      });
    }

    const isValid = await OTPService.verifyOTP(email, otp);

    if (!isValid) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Invalid OTP',
        data: null,
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: 'User not found',
        data: null,
      });
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'OTP verified successfully and user account verified',
      data: null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to verify OTP';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const OTPController = {
  sendOTP,
  verifyOTP,
};
