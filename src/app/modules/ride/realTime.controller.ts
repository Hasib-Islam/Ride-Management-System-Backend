import { Request, Response } from 'express';
import { getIO } from '../../services/socketService';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';

const emitRideUpdate = (req: Request, res: Response) => {
  try {
    const { rideId, update } = req.body;

    const io = getIO();
    io.emit('ride_update', {
      rideId,
      update,
      timestamp: new Date(),
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Ride update emitted successfully',
      data: null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to emit ride update';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const RealTimeController = {
  emitRideUpdate,
};
