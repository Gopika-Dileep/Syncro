import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { COMMON_MESSAGES } from '../constants/messages';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  permissions?: string[];
}

export const checkPermission = (requiredKey: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.userRole === 'company') {
      return next();
    }

    const userPermissions: string[] = req.permissions || [];

    if (userPermissions.includes(requiredKey)) {
      return next();
    }

    return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: COMMON_MESSAGES.ACCESS_DENIED(requiredKey) });
  };
};
