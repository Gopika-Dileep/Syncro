import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { AUTH_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { cookieUtils } from '../utils/cookie.utils';
import { success, created } from '../utils/response.utils';

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
      created(res, result.message);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._verifyOtpService.execute(req.body);
      cookieUtils.setRefreshToken(res, result.refreshToken);
      success(res, { user: result.user, permissions: result.permissions }, { token: result.accessToken });
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._resendOtpService.execute(req.body);
      success(res, result.message);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._loginService.execute(req.body);
      cookieUtils.setRefreshToken(res, result.refreshToken);
      success(res, { user: result.user, permissions: result.permissions }, { message: AUTH_MESSAGES.LOGIN_SUCCESS, token: result.accessToken });
    } catch (error) {
      next(error);
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
      success(res, { user: result.user, permissions: result.permissions }, { token: result.accessToken });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = cookieUtils.getRefreshToken(req);
      if (refreshToken) await this._logoutService.execute(refreshToken);
      cookieUtils.clearRefreshToken(res);
      success(res, AUTH_MESSAGES.LOGGED_OUT);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._forgotPasswordService.execute(req.body);
      success(res, result.message);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._resetPasswordService.execute(req.body);
      success(res, result.message);
    } catch (error) {
      next(error);
    }
  };
}
