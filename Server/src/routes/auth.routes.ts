import { Router } from "express";
import { authController } from "../container/auth.di";
import { ENDPOINTS } from "../constants/endpoints";
import { validateRequest } from "../middleware/validation.middleware";
import {
    RegisterRequestSchema,
    LoginRequestSchema,
    VerifyOtpRequestSchema,
    ResendOtpRequestSchema,
    ForgotPasswordRequestSchema,
    ResetPasswordRequestSchema
} from "../dto/auth.dto";

export class AuthRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
        this.router.post(ENDPOINTS.AUTH.REGISTER, validateRequest(RegisterRequestSchema), authController.register)
        this.router.post(ENDPOINTS.AUTH.VERIFY_OTP, validateRequest(VerifyOtpRequestSchema), authController.verifyOtp)
        this.router.post(ENDPOINTS.AUTH.RESEND_OTP, validateRequest(ResendOtpRequestSchema), authController.resendOtp)
        this.router.post(ENDPOINTS.AUTH.LOGIN, validateRequest(LoginRequestSchema), authController.login)
        this.router.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, validateRequest(ForgotPasswordRequestSchema), authController.forgotPassword)
        this.router.post(ENDPOINTS.AUTH.RESET_PASSWORD, validateRequest(ResetPasswordRequestSchema), authController.resetPassword)
        this.router.post(ENDPOINTS.AUTH.REFRESH, authController.refresh)
        this.router.post(ENDPOINTS.AUTH.LOGOUT, authController.logout)
    }
}