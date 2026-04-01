import { Router } from "express";
import { container } from "../di/inversify.config";
import { TYPES } from "../di/types";
import { UserController } from "../controller/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { ENDPOINTS } from "../constants/endpoints";
import { validateRequest } from "../middleware/validation.middleware";
import { ChangePasswordRequestSchema, UpdateProfileRequestSchema } from "../dto/user.dto";

const userController = container.get<UserController>(TYPES.UserController);

export class UserRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
        this.router.get(ENDPOINTS.USER.PROFILE, authMiddleware, userController.getProfile);
        this.router.post(ENDPOINTS.USER.CHANGE_PASSWORD, authMiddleware, validateRequest(ChangePasswordRequestSchema), userController.changePassword);
        this.router.put(ENDPOINTS.USER.PROFILE, authMiddleware, validateRequest(UpdateProfileRequestSchema), userController.updateProfile);
    }
}
