import { Request, Response } from 'express';
import { RideService } from './ride.service';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { IRideRequest, RideStatus } from './ride.interface';

const requestRide = async (req: Request, res: Response) => {
  try {
    const rideData: IRideRequest = req.body;
    const userId = (req.user as any)?._id;

    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'User not authenticated',
        data: null,
      });
    }

    const ride = await RideService.requestRide(rideData, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Ride requested successfully',
      data: ride,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to request ride';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: errorMessage,
      data: null,
    });
  }
};

const acceptRide = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const driverId = (req.user as any)?._id;

    if (!driverId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Driver not authenticated',
        data: null,
      });
    }

    const ride = await RideService.acceptRide(rideId, driverId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Ride accepted successfully',
      data: ride,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to accept ride';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: errorMessage,
      data: null,
    });
  }
};

const updateRideStatus = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    const userId = (req.user as any)?._id;
    const userRole = (req.user as any)?.role || '';

    if (!Object.values(RideStatus).includes(status)) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Invalid status',
        data: null,
      });
    }

    const ride = await RideService.updateRideStatus(
      rideId,
      status,
      userId,
      userRole
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Ride status updated successfully',
      data: ride,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update ride status';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: errorMessage,
      data: null,
    });
  }
};

const getRides = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?._id;
    const userRole = (req.user as any)?.role || '';
    const { status } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }

    const rides = await RideService.getRidesForUser(userId, userRole, filters);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Rides retrieved successfully',
      data: rides,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve rides';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const getAvailableRides = async (req: Request, res: Response) => {
  try {
    const rides = await RideService.getAvailableRides();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Available rides retrieved successfully',
      data: rides,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to retrieve available rides';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const RideController = {
  requestRide,
  acceptRide,
  updateRideStatus,
  getRides,
  getAvailableRides,
};
