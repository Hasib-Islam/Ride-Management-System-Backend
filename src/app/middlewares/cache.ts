import { Request, Response, NextFunction } from 'express';
import { redisService } from '../config/redis.config';

export const cache = (duration = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedData = await redisService.get(key);

    if (cachedData) {
      return res.json(cachedData);
    }

    const originalJson = res.json;
    res.json = function (body: any): Response {
      redisService.set(key, body, duration);
      return originalJson.call(this, body);
    };

    next();
  };
};
