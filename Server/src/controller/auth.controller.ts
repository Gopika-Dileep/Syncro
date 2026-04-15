import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { AUTH_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { cookieUtils } from '../utils/cookie.utils';
import { handleAsyncError } from '../utils/error.utils';

import { IRegisterService } from '../interfaces/services/auth/IRegisterService';
import { IVerifyOtpService } from '../interfaces/services/auth/IVerifyOtpService';
import { IResendOtpService } from '../interfaces/services/auth/IResendOtpService';
import { ILoginService } from '../interfaces/services/auth/ILoginService';
import { IRefreshService } from '../interfaces/services/auth/IRefreshService';
import { ILogoutService } from '../interfaces/services/auth/ILogoutService';
import { IForgotPasswordService } from '../interfaces/services/auth/IForgotPasswordService';
import { IResetPasswordService } from '../interfaces/services/auth/IResetPasswordService';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.IRegisterService) private _registerService: IRegisterService,
    @inject(TYPES.IVerifyOtpService) private _verifyOtpService: IVerifyOtpService,
    @inject(TYPES.IResendOtpService) private _resendOtpService: IResendOtpService,
    @inject(TYPES.ILoginService) private _loginService: ILoginService,
    @inject(TYPES.IRefreshService) private _refreshService: IRefreshService,
    @inject(TYPES.ILogoutService) private _logoutService: ILogoutService,
    @inject(TYPES.IForgotPasswordService) private _forgotPasswordService: IForgotPasswordService,
    @inject(TYPES.IResetPasswordService) private _resetPasswordService: IResetPasswordService,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._registerService.execute(req.body);
      res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._verifyOtpService.execute(req.body);
      cookieUtils.setRefreshToken(res, result.refreshToken);
      res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._resendOtpService.execute(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._loginService.execute(req.body);
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
      const result = await this._refreshService.execute(refreshToken);
      res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = cookieUtils.getRefreshToken(req);
      if (refreshToken) await this._logoutService.execute(refreshToken);
      cookieUtils.clearRefreshToken(res);
      res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._forgotPasswordService.execute(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._resetPasswordService.execute(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
