import { Router } from "express";
import { userController } from "../container/user.di";
import { authMiddleware } from "../middleware/auth.middleware";

export class UserRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
        this.router.get("/profile", authMiddleware, userController.getProfile);
        this.router.post("/change-password", authMiddleware, userController.changePassword);
        this.router.put("/profile",authMiddleware,userController.updateProfile);
    }
}
