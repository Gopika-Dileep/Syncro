import { verifyAccessToken } from '../utils/token.utils';
import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/user.model';
import { HttpStatus } from '../enums/HttpStatus';
import { AUTH_MESSAGES } from '../constants/messages';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      permissions?: string[];
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.NO_TOKEN });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) return;

    const decoded = verifyAccessToken(token);

    const user = await userModel.findById(decoded.id).select('is_blocked');
    if (!user || user.is_blocked) {
      res.status(HttpStatus.FORBIDDEN).json({ success: false, message: AUTH_MESSAGES.ACCOUNT_BLOCKED });
      return;
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.permissions = decoded.permissions || [];
    next();
  } catch {
    res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.INVALID_TOKEN });
  }
};
