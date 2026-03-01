import express, { Application, Router } from 'express';
import { AuthRouter } from './routes/auth.routes';
import cookieParser from "cookie-parser"
import { env } from './config/env';
import cors from 'cors';
import { EmployeeRouter } from './routes/employee.routes';
export default class App {
    public app: Application;
    constructor() {
        this.app = express();
        this._configureMiddleware();
        this._configureRoutes();
    }
    private _configureRoutes(): void {
        this.app.use('/api/auth', new AuthRouter().router);
        this.app.use('/api/company', new EmployeeRouter().router)
    }
    private _configureMiddleware():void{
        this.app.use(
            cors({
                origin:env.FRONTEND_URL,
                credentials:true,
            })
        )
        this.app.use(cookieParser())
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended:true}));
    }

}


