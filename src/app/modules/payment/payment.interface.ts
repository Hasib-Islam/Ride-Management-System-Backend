import { Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IPayment {
  _id?: Types.ObjectId;
  ride: Types.ObjectId;
  rider: Types.ObjectId;
  driver: Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  valId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentRequest {
  rideId: string;
  paymentMethod: string;
}
