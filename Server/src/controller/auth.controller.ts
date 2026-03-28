import { Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { HttpStatus } from "../enums/HttpStatus";
import { AUTH_MESSAGES } from "../constants/messages";
import { RegisterRequestDTO, VerifyOtpRequestDTO, LoginRequestDTO, ResendOtpRequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO } from "../dto/auth.dto";

export class AuthController {
    constructor(private _authService: IAuthService) { }

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this._authService.registration(req.body as RegisterRequestDTO)
            res.status(HttpStatus.CREATED).json({ success: true, message: result.message || AUTH_MESSAGES.REGISTRATION_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.REGISTRATION_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }

    verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this._authService.verifyOtp(req.body as VerifyOtpRequestDTO)

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.OTP_VERIFICATION_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }

    resendOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this._authService.resendOtp(req.body as ResendOtpRequestDTO)
            res.status(HttpStatus.OK).json({ success: true, message: result.message || AUTH_MESSAGES.OTP_RESEND_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.OTP_RESEND_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }


    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this._authService.login(req.body as LoginRequestDTO)
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.LOGIN_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }

    refresh = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken

            if (!refreshToken) {
                res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: AUTH_MESSAGES.NO_TOKEN })
                return
            }
            const result = await this._authService.refresh(refreshToken)
            res.status(HttpStatus.OK).json({ success: true, token: result.accessToken, user: result.user, permissions: result.permissions })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.REFRESH_FAILED
            res.status(HttpStatus.FORBIDDEN).json({ success: false, message })
        }
    }

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken

            if (refreshToken) {
                await this._authService.logout(refreshToken)
            }

            res.clearCookie("refreshToken")
            res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT })
        } catch (err: unknown) {
            res.clearCookie("refreshToken")
            res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.LOGGED_OUT })
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            await this._authService.forgotPassword(req.body as ForgotPasswordRequestDTO)
            res.status(HttpStatus.OK).json({
                success: true,
                message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS
            })

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.RESET_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            await this._authService.resetPassword(req.body as ResetPasswordRequestDTO)
            res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.RESET_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.RESET_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }
}