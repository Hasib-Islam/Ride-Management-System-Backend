import { Types } from 'mongoose';
import { Ride } from './ride.model';
import { IRideRequest, RideStatus } from './ride.interface';
import { AppError } from '../../errorHelpers/AppError';
import { getIO } from '../../services/socketService';
import { User } from '../user/user.model';

const requestRide = async (rideData: IRideRequest, riderId: Types.ObjectId) => {
  const estimatedFare = calculateEstimatedFare(rideData);

  const ride = await Ride.create({
    ...rideData,
    rider: riderId,
    estimatedFare,
  });

  await notifyDriversAboutNewRide(ride);

  return ride;
};

const acceptRide = async (rideId: string, driverId: Types.ObjectId) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  if (ride.status !== 'requested') {
    throw new AppError('Ride is not available for acceptance', 400);
  }

  ride.driver = driverId;
  ride.status = RideStatus.ACCEPTED;
  ride.acceptedAt = new Date();

  await ride.save();

  const driver = await User.findById(driverId);

  const io = getIO();
  io.to(`user_${ride.rider.toString()}`).emit('ride_accepted', {
    rideId: ride._id,
    driver: {
      _id: driver?._id,
      name: driver?.name,
      vehicleInfo: driver?.vehicleInfo,
    },
    status: ride.status,
  });

  return ride;
};

const updateRideStatus = async (
  rideId: string,
  status: RideStatus,
  userId: string,
  userRole: string
) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  if (userRole === 'driver' && ride.driver?.toString() !== userId) {
    throw new AppError('Not authorized to update this ride', 403);
  }

  if (userRole === 'rider' && ride.rider.toString() !== userId) {
    throw new AppError('Not authorized to update this ride', 403);
  }

  ride.status = status;

  switch (status) {
    case RideStatus.ACCEPTED:
      ride.acceptedAt = new Date();
      ride.driver = new Types.ObjectId(userId);
      break;
    case RideStatus.IN_PROGRESS:
      ride.startedAt = new Date();
      break;
    case RideStatus.COMPLETED:
      ride.completedAt = new Date();
      break;
    case RideStatus.CANCELLED:
      ride.cancelledAt = new Date();
      break;
  }

  await ride.save();
  const io = getIO();
  const updateData = {
    rideId: ride._id,
    status: ride.status,
    timestamp: new Date(),
  };

  io.to(`user_${ride.rider.toString()}`).emit(
    'ride_status_updated',
    updateData
  );
  if (ride.driver) {
    io.to(`user_${ride.driver.toString()}`).emit(
      'ride_status_updated',
      updateData
    );
  }

  return ride;
};

const getRidesForUser = async (
  userId: Types.ObjectId,
  userRole: string,
  filters: any = {}
) => {
  const query: any = {};

  if (userRole === 'rider') {
    query.rider = userId;
  } else if (userRole === 'driver') {
    query.driver = userId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const rides = await Ride.find(query)
    .populate('rider', 'name email phone')
    .populate('driver', 'name email phone vehicleInfo')
    .sort({ createdAt: -1 });

  return rides;
};

const getAvailableRides = async () => {
  const rides = await Ride.find({ status: 'requested' })
    .populate('rider', 'name rating')
    .sort({ createdAt: -1 });

  return rides;
};

const completeRideWithPayment = async (rideId: string, finalFare: number) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError('Ride not found', 404);
  }

  ride.status = RideStatus.COMPLETED;
  ride.finalFare = finalFare;
  ride.completedAt = new Date();

  await ride.save();

  const io = getIO();
  io.to(`user_${ride.rider.toString()}`).emit('ride_completed', {
    rideId: ride._id,
    finalFare,
    status: ride.status,
  });

  if (ride.driver) {
    io.to(`user_${ride.driver.toString()}`).emit('ride_completed', {
      rideId: ride._id,
      finalFare,
      status: ride.status,
    });
  }

  return ride;
};

const notifyDriversAboutNewRide = async (ride: any) => {
  const io = getIO();

  const rideWithDetails = await Ride.findById(ride._id).populate(
    'rider',
    'name rating'
  );

  if (!rideWithDetails) {
    return;
  }

  const riderDetails = rideWithDetails.rider as any;

  io.to('available_drivers').emit('new_ride_available', {
    rideId: rideWithDetails._id,
    pickupLocation: rideWithDetails.pickupLocation,
    destination: rideWithDetails.destination,
    estimatedFare: rideWithDetails.estimatedFare,
    rider: {
      name: riderDetails.name,
      rating: riderDetails.rating,
    },
    requestedAt: rideWithDetails.requestedAt,
  });
};

const calculateEstimatedFare = (rideData: IRideRequest): number => {
  const baseFare = 2.5;
  const perKmRate = 1.5;
  const perMinuteRate = 0.3;

  const distance = calculateDistance(
    rideData.pickupLocation.coordinates,
    rideData.destination.coordinates
  );

  const time = distance * 2;

  const fare = baseFare + distance * perKmRate + time * perMinuteRate;

  return Math.round(fare * 100) / 100;
};

const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

export const RideService = {
  requestRide,
  acceptRide,
  updateRideStatus,
  getRidesForUser,
  getAvailableRides,
  completeRideWithPayment,
};
