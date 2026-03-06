import { Request, Response } from "express";
import { IAuthService } from "../../interfaces/services/IAuthService";

export class AuthController {
    constructor(private _authService: IAuthService) { }

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password, companyName } = req.body
            const result = await this._authService.registration(name, email, password, companyName)

            res.status(201).json({ success: true, message:result.message})
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Registration failed";
            res.status(400).json({ success: false, message });
        }
    }

    verifyOtp = async (req: Request, res: Response): Promise<void> => {
        try{
            const {email,otp} = req.body
            const result = await this._authService.verifyOtp(email,otp)

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(200).json({ success: true, token: result.accessToken })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Otp verification failed";
            res.status(400).json({ success: false, message });
        }
    }

    resendOtp = async (req:Request , res:Response):Promise<void>=>{
        try{
            const {email} = req.body
            const result = await this._authService.resendOtp(email)
            res.status(200).json({success:true,message:result.message})
        }catch(err:unknown){
            const message = err instanceof Error? err.message :"Failed to resend otp";
            res.status(400).json({success:false,message});
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
            res.status(200).json({ success: true, token: result.accessToken })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed";
            res.status(400).json({ success: false, message });
        }
    }

    refresh = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken

            if (!refreshToken) {
                res.status(401).json({ success: false, message: "No refersh token" })
                return
            }
            const result = await this._authService.refresh(refreshToken)
            res.status(200).json({ success: true, token: result.accessToken })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "TOken refresh failed"
            res.status(403).json({ success: false, message })
        }
    }

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken

            if (refreshToken) {
                await this._authService.logout(refreshToken)
            }

            res.clearCookie("refreshToken")
            res.status(200).json({ success: true, message: "Logged out" })
        } catch (err: unknown) {
            res.clearCookie("refreshToken")
            res.status(200).json({ success: true, message: "Logged out" })
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body
            await this._authService.forgotPassword(email)
            res.status(200).json({
                success: true,
                message: "If this email exists, a reset link has been sent"
            })

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "something went wrong"
            res.status(400).json({ success: false, message })
        }
    }

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, newPassword } = req.body
            await this._authService.resetPassword(token, newPassword)
            res.status(200).json({ success: true, message: "password reset successful" })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "reset failed"
            res.status(400).json({ success: false, message })
        }
    }
}