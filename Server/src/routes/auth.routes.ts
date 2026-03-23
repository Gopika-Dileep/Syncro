import { Router } from "express";
import { authController } from "../container/auth.di";
import { ENDPOINTS } from "../constants/endpoints";

export class AuthRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
       this.router.post(ENDPOINTS.AUTH.REGISTER, authController.register)
       this.router.post(ENDPOINTS.AUTH.VERIFY_OTP, authController.verifyOtp)
       this.router.post(ENDPOINTS.AUTH.RESEND_OTP, authController.resendOtp)
       this.router.post(ENDPOINTS.AUTH.LOGIN, authController.login)
       this.router.post(ENDPOINTS.AUTH.REFRESH, authController.refresh)
       this.router.post(ENDPOINTS.AUTH.LOGOUT, authController.logout)
       this.router.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, authController.forgotPassword)
       this.router.post(ENDPOINTS.AUTH.RESET_PASSWORD, authController.resetPassword)
    }
}