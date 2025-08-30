import { z } from 'zod';

const coordinatesSchema = z.tuple([z.number(), z.number()]);

const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  coordinates: coordinatesSchema,
});

export const rideRequestSchema = z.object({
  body: z.object({
    pickupLocation: locationSchema,
    destination: locationSchema,
  }),
});

export const rideStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'requested',
      'accepted',
      'in-progress',
      'completed',
      'cancelled',
    ]),
  }),
});

export const rideIdSchema = z.object({
  params: z.object({
    rideId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ride ID'),
  }),
});
