import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';

const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await AdminService.getDashboardStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve dashboard stats';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const getRecentRides = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const rides = await AdminService.getRecentRides(limit);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Recent rides retrieved successfully',
      data: rides,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve recent rides';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await AdminService.getRevenueAnalytics(days);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Revenue analytics retrieved successfully',
      data: analytics,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve revenue analytics';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const AdminController = {
  getDashboardStats,
  getRecentRides,
  getRevenueAnalytics,
};
