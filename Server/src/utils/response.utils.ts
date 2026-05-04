import { Response } from 'express';
import { HttpStatus } from '../enums/HttpStatus';

export function createSuccessResponse<T>(message: string | null, data: T, token?: string) {
  return {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && data !== null && { data }),
    ...(token && { token }),
  };
}

export function createErrorResponse<T>(message: string, data: T) {
  return {
    success: false,
    message,
    ...(data !== undefined && data !== null && { data }),
  };
}

export function sendSuccessResponse<T>(
  res: Response,
  message: string,
  data: T,
  token?: string,
  statusCode: number = HttpStatus.OK
): void {
  res.status(statusCode).json(createSuccessResponse(message, data, token));
}

export function sendErrorResponse<T>(
  res: Response,
  message: string,
  data: T = null as T,
  statusCode: number = HttpStatus.BAD_REQUEST
): void {
  res.status(statusCode).json(createErrorResponse(message, data));
}

export function sendNotFoundResponse(res: Response, message: string): void {
  res.status(HttpStatus.NOT_FOUND).json(createErrorResponse(message, null));
}

export function success(
  res: Response,
  dataOrMessage?: any,
  message: string = '',
  statusCode: number = HttpStatus.OK
): void {
  let finalMessage = message;
  let finalData = dataOrMessage;

  if (typeof dataOrMessage === 'string' && message === '') {
    finalMessage = dataOrMessage;
    finalData = undefined;
  }

  sendSuccessResponse(res, finalMessage, finalData, undefined, statusCode);
}

export function created(
  res: Response,
  dataOrMessage?: any,
  message: string = ''
): void {
  let finalMessage = message;
  let finalData = dataOrMessage;

  if (typeof dataOrMessage === 'string' && message === '') {
    finalMessage = dataOrMessage;
    finalData = undefined;
  }

  sendSuccessResponse(res, finalMessage, finalData, undefined, HttpStatus.CREATED);
}

export function sendNoContentResponse(res: Response): void {
  res.status(HttpStatus.NO_CONTENT).send();
}
