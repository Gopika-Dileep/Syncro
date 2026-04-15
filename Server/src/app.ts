import express, { Application } from 'express';
import { AuthRouter } from './routes/auth.routes';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import cors from 'cors';
import { CompanyRouter } from './routes/company.routes';
import { UserRouter } from './routes/user.routes';
import { morganMiddleware } from './middleware/morgan.middleware';
import { errorMiddleware } from './middleware/error.middleware';

import { ProjectRouter } from './routes/project.routes';
import { UserStoryRouter } from './routes/userStory.routes';
import { TeamRouter } from './routes/team.routes';
export default class App {
  public app: Application;
  constructor() {
    this.app = express();
    this._configureMiddleware();
    this._configureRoutes();
    this.app.use(errorMiddleware);
  }
  private _configureRoutes(): void {
    this.app.use('/api/auth', new AuthRouter().router);
    this.app.use('/api/company', new CompanyRouter().router);
    this.app.use('/api/user', new UserRouter().router);
    this.app.use('/api/projects', new ProjectRouter().router);
    this.app.use('/api/user-stories', new UserStoryRouter().router);
    this.app.use('/api/teams', new TeamRouter().router);
  }
  private _configureMiddleware(): void {
    this.app.use(morganMiddleware);
    this.app.use(
      cors({
        origin: env.FRONTEND_URL,
        credentials: true,
      }),
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
}
