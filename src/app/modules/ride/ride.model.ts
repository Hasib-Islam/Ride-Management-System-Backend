import { Schema, model } from 'mongoose';
import { IRide, RideStatus } from './ride.interface';

const rideSchema = new Schema<IRide>(
  {
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup location address is required'],
      },
      coordinates: {
        type: [Number],
        required: [true, 'Pickup coordinates are required'],
        index: '2dsphere',
      },
    },
    destination: {
      address: {
        type: String,
        required: [true, 'Destination address is required'],
      },
      coordinates: {
        type: [Number],
        required: [true, 'Destination coordinates are required'],
        index: '2dsphere',
      },
    },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },
    estimatedFare: {
      type: Number,
      required: [true, 'Estimated fare is required'],
      min: [0, 'Fare cannot be negative'],
    },
    finalFare: {
      type: Number,
      min: [0, 'Fare cannot be negative'],
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rider is required'],
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

rideSchema.index({ rider: 1, status: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ status: 1 });

export const Ride = model<IRide>('Ride', rideSchema);
