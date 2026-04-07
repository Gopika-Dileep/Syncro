import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import type { IAuthService } from '../interfaces/services/IAuthService';
import { HttpStatus } from '../enums/HttpStatus';
import { AUTH_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { cookieUtils } from '../utils/cookie.utils';
import { handleAsyncError } from '../utils/error.utils';
@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private _authService: IAuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._authService.registration(req.body);
      res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._authService.verifyOtp(req.body);
      cookieUtils.setRefreshToken(res, result.refreshToken);
      res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._authService.resendOtp(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._authService.login(req.body);
      cookieUtils.setRefreshToken(res, result.refreshToken);
      res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = cookieUtils.getRefreshToken(req);
      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.NO_TOKEN });
        return;
      }
      const result = await this._authService.refresh(refreshToken);
      res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = cookieUtils.getRefreshToken(req);
      if (refreshToken) await this._authService.logout(refreshToken);
      cookieUtils.clearRefreshToken(res);
      res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._authService.forgotPassword(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._authService.resetPassword(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
