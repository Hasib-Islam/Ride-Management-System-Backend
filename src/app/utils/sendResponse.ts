import { Response } from 'express';

export const sendResponse = <T>(
  res: Response,
  data: {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
  }
) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  });
};
