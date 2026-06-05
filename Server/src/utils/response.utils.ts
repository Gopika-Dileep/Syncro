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

function sendSuccessResponse<T>(res: Response, message: string, data: T, token?: string, statusCode: number = HttpStatus.OK): void {
  res.status(statusCode).json(createSuccessResponse(message, data, token));
}

export function sendErrorResponse<T>(res: Response, message: string, data: T = null as T, statusCode: number = HttpStatus.BAD_REQUEST): void {
  res.status(statusCode).json(createErrorResponse(message, data));
}

export function sendNotFoundResponse(res: Response, message: string): void {
  res.status(HttpStatus.NOT_FOUND).json(createErrorResponse(message, null));
}

export function success<T>(res: Response, dataOrMessage?: T | string, optionsOrMessage?: string | { message?: string; statusCode?: number; token?: string }, statusCode: number = HttpStatus.OK): void {
  let finalMessage = '';
  let finalData: T | undefined = dataOrMessage as T;
  let finalStatusCode = statusCode;
  let finalToken: string | undefined = undefined;

  if (typeof dataOrMessage === 'string') {
    finalMessage = dataOrMessage;
    finalData = undefined;
  }

  if (typeof optionsOrMessage === 'string') {
    finalMessage = optionsOrMessage;
  } else if (optionsOrMessage && typeof optionsOrMessage === 'object') {
    if (optionsOrMessage.message !== undefined) {
      finalMessage = optionsOrMessage.message;
    }
    if (optionsOrMessage.statusCode !== undefined) {
      finalStatusCode = optionsOrMessage.statusCode;
    }
    if (optionsOrMessage.token !== undefined) {
      finalToken = optionsOrMessage.token;
    }
  }

  sendSuccessResponse(res, finalMessage, finalData as T, finalToken, finalStatusCode);
}

export function created<T>(res: Response, dataOrMessage?: T | string, message: string = ''): void {
  let finalMessage = message;
  let finalData: T | undefined = dataOrMessage as T;

  if (typeof dataOrMessage === 'string' && message === '') {
    finalMessage = dataOrMessage;
    finalData = undefined;
  }

  sendSuccessResponse(res, finalMessage, finalData as T, undefined, HttpStatus.CREATED);
}

export function sendNoContentResponse(res: Response): void {
  res.status(HttpStatus.NO_CONTENT).send();
}
