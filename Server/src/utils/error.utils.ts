import { NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { HttpStatus } from '../enums/HttpStatus';

export const handleAsyncError = (error: unknown, next: NextFunction): void => {
  if (error instanceof AppError) {
    next(error);
  } else if (error instanceof Error) {
    next(new AppError(error.message, HttpStatus.INTERNAL_SERVER_ERROR, false));
  } else {
    next(new AppError('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR, false));
  }
};
