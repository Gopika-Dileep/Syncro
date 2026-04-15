import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

export const errorMiddleware = (err: AppError | Error, _req: Request, res: Response, _next: NextFunction): void => {
  void _next;
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof AppError && err.details ? { details: err.details } : {}),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
