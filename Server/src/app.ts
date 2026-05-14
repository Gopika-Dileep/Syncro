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
import { IssueRouter } from './routes/issue.routes';
import { TeamRouter } from './routes/team.routes';
import { SprintRouter } from './routes/sprint.routes';
import { SubTaskRouter } from './routes/subTask.routes';
import { UploadRouter } from './routes/upload.routes';
import { DashboardRouter } from './routes/dashboard.routes';
import { NotificationRouter } from './routes/notification.routes';
import path from 'path';
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
    this.app.use('/api/issues', new IssueRouter().router);
    this.app.use('/api/teams', new TeamRouter().router);
    this.app.use('/api/sprints', new SprintRouter().router);
    this.app.use('/api/subtasks', new SubTaskRouter().router);
    this.app.use('/api/upload', new UploadRouter().router);
    this.app.use('/api/dashboard', new DashboardRouter().router);
    this.app.use('/api/notifications', new NotificationRouter().router);
    this.app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
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
