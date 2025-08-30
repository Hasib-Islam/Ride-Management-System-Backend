// src/server.ts
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './app/config/env';
import { seedSuperAdmin } from './app/utils/seedSuperAdmin';
import { initSocketServer } from './app/services/socketService';
import * as Sentry from '@sentry/node';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DATABASE_URL);
    console.log('Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
      });
    }

    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.ENABLE_SOCKETIO === 'true'
    ) {
      initSocketServer(server);
      console.log('Socket.io initialized');
    } else {
      console.log('Socket.io disabled in production');
    }

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.SEED_DATA === 'true'
    ) {
      await seedSuperAdmin();
    }

    const gracefulShutdown = () => {
      console.log('Received shutdown signal, shutting down gracefully');
      server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
      });

      setTimeout(() => {
        console.error(
          'Could not close connections in time, forcefully shutting down'
        );
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
