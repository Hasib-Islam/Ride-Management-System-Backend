import { Types } from 'mongoose';
import { Payment } from './payment.model';
import { AppError } from '../../errorHelpers/AppError';
import { Ride } from '../ride/ride.model';
import { PaymentStatus } from './payment.interface';

const createPayment = async (paymentData: any, riderId: string) => {
  const riderObjectId = new Types.ObjectId(riderId);

  const ride = await Ride.findById(paymentData.rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  if (ride.status !== 'completed' && ride.status !== 'accepted') {
    throw new AppError(
      'Ride must be completed or accepted before payment',
      400
    );
  }

  const existingPayment = await Payment.findOne({ ride: ride._id });
  if (existingPayment) {
    throw new AppError('Payment already exists for this ride', 400);
  }

  const payment = await Payment.create({
    ride: ride._id,
    rider: riderObjectId,
    driver: ride.driver as Types.ObjectId,
    amount: ride.finalFare || ride.estimatedFare,
    paymentMethod: paymentData.paymentMethod,
    transactionId: paymentData.transactionId,
    status: 'pending',
  });

  return payment;
};

const updatePaymentStatus = async (
  transactionId: string,
  status: string,
  valId?: string
) => {
  const payment = await Payment.findOne({ transactionId });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (!Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    throw new AppError('Invalid payment status', 400);
  }

  payment.status = status as PaymentStatus;

  if (valId) {
    payment.valId = valId;
  }

  if (status === PaymentStatus.COMPLETED) {
    payment.paidAt = new Date();
  }

  await payment.save();

  return payment;
};

const getPaymentsForUser = async (userId: Types.ObjectId, role: string) => {
  let query = {};

  if (role === 'rider') {
    query = { rider: userId };
  } else if (role === 'driver') {
    query = { driver: userId };
  }

  const payments = await Payment.find(query)
    .populate('ride')
    .populate('rider', 'name email')
    .populate('driver', 'name email')
    .sort({ createdAt: -1 });

  return payments;
};

export const PaymentService = {
  createPayment,
  updatePaymentStatus,
  getPaymentsForUser,
};
