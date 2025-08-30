import { Request, Response } from 'express';
import { LocationService } from '../../services/locationService';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';

const updateDriverLocation = async (req: Request, res: Response) => {
  try {
    const driverId = (req.user as any)?._id;
    const { lat, lng } = req.body;

    if (!driverId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Driver not authenticated',
        data: null,
      });
    }

    const result = await LocationService.updateDriverLocation(
      driverId.toString(),
      { lat, lng }
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Driver location updated successfully',
      data: result,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update driver location';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const updateRideLocation = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { lat, lng } = req.body;

    const result = await LocationService.updateRideLocation(rideId, {
      lat,
      lng,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Ride location updated successfully',
      data: result,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update ride location';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const LocationController = {
  updateDriverLocation,
  updateRideLocation,
};
