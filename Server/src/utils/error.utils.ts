import { NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const handleAsyncError = (error: unknown, next: NextFunction): void => {
  if (error instanceof AppError) {
    next(error);
  } else if (error instanceof Error) {
    // If it's a standard error, wrap it in AppError.
    // You might want to default to 400 or 500 based on your app's logic.
    // For now defaulting to 400 to match previous behavior in try-catch blocks.
    next(new AppError(error.message, 400, false));
  } else {
    next(new AppError('An unexpected error occurred', 500, false));
  }
};
