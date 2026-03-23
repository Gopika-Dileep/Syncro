import { Request, Response } from "express";
import { IAuthService } from "../../interfaces/services/IAuthService";
import { HttpStatus } from "../../enums/HttpStatus";
import { AUTH_MESSAGES } from "../../constants/messages";

export class AuthController {
    constructor(private _authService: IAuthService) { }

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password, companyName } = req.body
            const result = await this._authService.registration(name, email, password, companyName)

            res.status(HttpStatus.CREATED).json({ success: true, message: result.message || AUTH_MESSAGES.REGISTRATION_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.REGISTRATION_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }

    verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, otp } = req.body
            const result = await this._authService.verifyOtp(email, otp)

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
            const { email } = req.body
            const result = await this._authService.resendOtp(email)
            res.status(HttpStatus.OK).json({ success: true, message: result.message || AUTH_MESSAGES.OTP_RESEND_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.OTP_RESEND_FAILED;
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
        }
    }


    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body
            const result = await this._authService.login(email, password)
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
            const { email } = req.body
            await this._authService.forgotPassword(email)
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
            const { token, newPassword } = req.body
            await this._authService.resetPassword(token, newPassword)
            res.status(HttpStatus.OK).json({ success: true, message: AUTH_MESSAGES.RESET_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : AUTH_MESSAGES.RESET_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }
}