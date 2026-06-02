import { Router } from 'express';
import { TYPES } from '../di/types';
import { container } from '../di/inversify.config';
import { DashboardController } from '../controller/dashboard.controller';
import { authMiddleware, checkRole } from '../middleware/auth.middleware';
import { ENDPOINTS } from '../constants/endpoints';

const controller = container.get<DashboardController>(TYPES.DashboardController);

export class DashboardRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._configureRoutes();
  }

  private _configureRoutes(): void {
    this.router.get(ENDPOINTS.DASHBOARD.COMPANY, authMiddleware, checkRole(['company']), controller.getCompanyDashboard);
    this.router.get(ENDPOINTS.DASHBOARD.EMPLOYEE, authMiddleware, checkRole(['employee']), controller.getEmployeeDashboard);
  }
}
