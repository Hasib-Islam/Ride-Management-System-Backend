import { Request, Response } from 'express';
import { User } from './user.model';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { IUserDocument } from './user.interface';
import { envVars } from '../../config/env';

const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req.user as IUserDocument)?._id).select(
      '-password'
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
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve profile';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      (req.user as IUserDocument)?._id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

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
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update profile';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Request body is required',
        data: null,
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Current password and new password are required',
        data: null,
      });
    }

    const userId = (req.user as IUserDocument)?._id;

    const user = await User.findById(userId).select('+password');

    if (!user || !user.password) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: 'User not found',
        data: null,
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Current password is incorrect',
        data: null,
      });
    }

    user.password = newPassword;
    await user.save();

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    user.password = hashedPassword;
    await user.save();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to change password';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const UserController = {
  getProfile,
  updateProfile,
  changePassword,
};
