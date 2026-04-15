import { HttpStatus } from '../enums/HttpStatus';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, isOperational = true, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, HttpStatus.UNAUTHORIZED, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, HttpStatus.FORBIDDEN, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details?: unknown) {
    super(message, HttpStatus.NOT_FOUND, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: unknown) {
    super(message, HttpStatus.CONFLICT, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, true, details);
  }
}
