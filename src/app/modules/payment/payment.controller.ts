import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { SSLCommerzService } from '../../services/sslCommerzService';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { Ride } from '../ride/ride.model';
import { User } from '../user/user.model';
import { Payment } from './payment.model';

const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.body;
    const userId = (req.user as any)?._id;
    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'User not authenticated',
        data: null,
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: 'Ride not found',
        data: null,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: 'User not found',
        data: null,
      });
    }

    const tran_id = SSLCommerzService.generateTransactionId();

    const paymentData = {
      total_amount: ride.finalFare || ride.estimatedFare,
      tran_id: tran_id,
      cus_name: user.name,
      cus_email: user.email,
      cus_phone: user.phone || 'N/A',
      cus_add1: 'N/A',
      cus_city: 'N/A',
      product_name: `Ride from ${ride.pickupLocation.address} to ${ride.destination.address}`,
    };

    const paymentInitResponse = await SSLCommerzService.initiatePayment(
      paymentData
    );

    if (paymentInitResponse.status !== 'SUCCESS') {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message:
          paymentInitResponse.failedreason || 'Failed to initiate payment',
        data: null,
      });
    }

    const payment = await PaymentService.createPayment(
      {
        rideId,
        paymentMethod: 'SSLCommerz',
        transactionId: tran_id,
      },
      userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Payment initiated successfully',
      data: {
        payment,
        gatewayURL: paymentInitResponse.GatewayPageURL,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to initiate payment';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const handleIPN = async (req: Request, res: Response) => {
  try {
    const { val_id, tran_id, status } = req.body;

    if (status !== 'VALID') {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Invalid payment',
        data: null,
      });
    }

    const validationResponse = await SSLCommerzService.validatePayment(val_id);

    if (validationResponse.status !== 'VALID') {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Payment validation failed',
        data: null,
      });
    }

    const payment = await PaymentService.updatePaymentStatus(
      tran_id,
      'completed',
      val_id
    );

    if (!payment) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: 'Payment not found',
        data: null,
      });
    }

    await Ride.findByIdAndUpdate(payment.ride, {
      status: 'completed',
      completedAt: new Date(),
    });

    res.status(200).send('IPN received and processed successfully');
  } catch (error: unknown) {
    console.error('Error processing IPN:', error);
    res.status(500).send('Error processing IPN');
  }
};

const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { tran_id } = req.params;

    const payment = await Payment.findOne({ transactionId: tran_id });

    if (!payment) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: 'Payment not found',
        data: null,
      });
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Payment status retrieved successfully',
      data: payment,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to check payment status';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

const getMyPayments = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?._id;
    if (!userId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'User not authenticated',
        data: null,
      });
    }

    const payments = await Payment.find({
      $or: [{ rider: userId }, { driver: userId }],
    })
      .populate('ride')
      .sort({ createdAt: -1 });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Payments retrieved successfully',
      data: payments,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve payments';

    sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      data: null,
    });
  }
};

export const PaymentController = {
  initiatePayment,
  handleIPN,
  checkPaymentStatus,
  getMyPayments,
};
