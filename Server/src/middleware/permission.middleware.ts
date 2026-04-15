import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { COMMON_MESSAGES } from '../constants/messages';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  permissions?: string[];
}

export const checkPermission = (requiredKey: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.userRole === 'company') {
      return next();
    }

    const userPermissions: string[] = req.permissions || [];
    const keysToCheck = Array.isArray(requiredKey) ? requiredKey : [requiredKey];

    const hasPermission = keysToCheck.some((key) => userPermissions.includes(key));

    if (hasPermission) {
      return next();
    }

    const firstKey = (Array.isArray(requiredKey) ? requiredKey[0] : requiredKey) || 'unknown';
    return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: COMMON_MESSAGES.ACCESS_DENIED(firstKey) });
  };
};
