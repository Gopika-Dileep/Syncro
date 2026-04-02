import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import type { IAuthService } from '../interfaces/services/IAuthService';
import { HttpStatus } from '../enums/HttpStatus';
import { AUTH_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { env } from '../config/env';

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private _authService: IAuthService) { }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._authService.registration(req.body);
      res
        .status(HttpStatus.CREATED)
        .json({ success: true, message: result.message || AUTH_MESSAGES.REGISTRATION_SUCCESS });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.REGISTRATION_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._authService.verifyOtp(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        maxAge: env.REFRESH_TOKEN_COOKIE_MAX_AGE,
      });
      res
        .status(HttpStatus.OK)
        .json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.OTP_VERIFICATION_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._authService.resendOtp(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message || AUTH_MESSAGES.OTP_RESEND_SUCCESS });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.OTP_RESEND_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        maxAge: env.REFRESH_TOKEN_COOKIE_MAX_AGE,
      });
      res
        .status(HttpStatus.OK)
        .json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.LOGIN_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.NO_TOKEN });
        return;
      }
      const result = await this._authService.refresh(refreshToken);
      res
        .status(HttpStatus.OK)
        .json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.REFRESH_FAILED;
      res.status(HttpStatus.FORBIDDEN).json({ success: false, message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await this._authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT });
    } catch {
      res.clearCookie('refreshToken');
      res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this._authService.forgotPassword(req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.RESET_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this._authService.resetPassword(req.body);
      res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.RESET_SUCCESS });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : AUTH_MESSAGES.RESET_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };
}
