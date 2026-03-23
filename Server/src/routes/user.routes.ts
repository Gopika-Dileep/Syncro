import { Router } from "express";
import { userController } from "../container/user.di";
import { authMiddleware } from "../middleware/auth.middleware";
import { ENDPOINTS } from "../constants/endpoints";

export class UserRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
        this.router.get(ENDPOINTS.USER.PROFILE, authMiddleware, userController.getProfile);
        this.router.post(ENDPOINTS.USER.CHANGE_PASSWORD, authMiddleware, userController.changePassword);
        this.router.put(ENDPOINTS.USER.PROFILE, authMiddleware, userController.updateProfile);
    }
}
