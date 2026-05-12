import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Access denied: Insufficient permissions',
      });
    }

    next();
  };
};
