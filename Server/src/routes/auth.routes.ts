import { Router } from "express";
import { authController } from "../container/auth.di";

export class AuthRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
       this.router.post('/register', authController.register)
       this.router.post('/login',authController.login)
    }
}