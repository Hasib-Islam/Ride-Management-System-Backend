import { getIO } from './socketService';

export const LocationService = {
  updateDriverLocation: async (
    driverId: string,
    location: { lat: number; lng: number }
  ) => {
    const io = getIO();

    io.emit(`driver_location_${driverId}`, {
      driverId,
      location,
      timestamp: new Date(),
    });

    return { success: true };
  },

  updateRideLocation: async (
    rideId: string,
    location: { lat: number; lng: number }
  ) => {
    const io = getIO();

    io.emit(`ride_location_${rideId}`, {
      rideId,
      location,
      timestamp: new Date(),
    });

    return { success: true };
  },
};
