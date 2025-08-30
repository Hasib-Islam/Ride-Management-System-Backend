import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { envVars } from '../config/env';
import { User } from '../modules/user/user.model';

let io: SocketServer | null = null;

export const initSocketServer = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: envVars.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, envVars.JWT_ACCESS_SECRET) as any;
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication error: User is deactivated'));
      }

      socket.user = user;
      next();
    } catch (error: any) {
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on('connection', (socket: any) => {
    console.log('User connected:', socket.user._id);

    socket.join(`user_${socket.user._id}`);

    if (socket.user.role === 'driver') {
      socket.join('drivers');
    }

    socket.on('listen_for_rides', () => {
      if (socket.user.role === 'driver') {
        socket.join('available_drivers');
        console.log(`Driver ${socket.user._id} is now listening for rides`);
      }
    });

    socket.on('ride_status_update', (data: any) => {
      const { rideId, status } = data;

      if (io) {
        io.to(`ride_${rideId}`).emit('ride_updated', {
          rideId,
          status,
          updatedAt: new Date(),
        });
      } else {
        console.error('Socket.io not initialized');
      }
    });

    socket.on('location_update', (data: any) => {
      const { rideId, location } = data;

      socket.to(`ride_${rideId}`).emit('location_updated', {
        rideId,
        location,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user._id);

      if (socket.user.role === 'driver') {
        socket.leave('available_drivers');
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
