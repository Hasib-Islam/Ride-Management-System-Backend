import { Types } from 'mongoose';

export enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IRide {
  _id?: Types.ObjectId;
  pickupLocation: {
    address: string;
    coordinates: [number, number];
  };
  destination: {
    address: string;
    coordinates: [number, number];
  };
  status: RideStatus;
  estimatedFare: number;
  finalFare?: number;
  rider: Types.ObjectId;
  driver?: Types.ObjectId;
  requestedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface IRideRequest {
  pickupLocation: {
    address: string;
    coordinates: [number, number];
  };
  destination: {
    address: string;
    coordinates: [number, number];
  };
}

export interface IRideUpdate {
  status?: RideStatus;
  driver?: Types.ObjectId;
  finalFare?: number;
}
