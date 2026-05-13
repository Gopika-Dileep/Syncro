import { Router } from 'express';
import { TYPES } from '../di/types';
import { container } from '../di/inversify.config';
import { DashboardController } from '../controller/dashboard.controller';
import { authMiddleware, checkRole } from '../middleware/auth.middleware';

export class DashboardRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._configureRoutes();
  }

  private _configureRoutes(): void {
    const controller = container.get<DashboardController>(TYPES.DashboardController);

    this.router.get(
      '/company',
      authMiddleware,
      checkRole(['company']),
      controller.getCompanyDashboard
    );

    this.router.get(
      '/employee',
      authMiddleware,
      checkRole(['employee']),
      controller.getEmployeeDashboard
    );
  }
}
