import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IGetCompanyDashboardService } from '../interfaces/services/dashboard/IGetCompanyDashboardService';
import { IGetEmployeeDashboardService } from '../interfaces/services/dashboard/IGetEmployeeDashboardService';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { success } from '../utils/response.utils';

@injectable()
export class DashboardController {
  constructor(
    @inject(TYPES.IGetCompanyDashboardService) private _getCompanyDashboardService: IGetCompanyDashboardService,
    @inject(TYPES.IGetEmployeeDashboardService) private _getEmployeeDashboardService: IGetEmployeeDashboardService,
  ) {}

  getCompanyDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const data = await this._getCompanyDashboardService.execute(userId);
      success(res, data);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getEmployeeDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const filter = {
        projectId: req.query.projectId as string,
        sprintId: req.query.sprintId as string,
        teamId: req.query.teamId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const data = await this._getEmployeeDashboardService.execute(userId, permissions, filter);
      success(res, data);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
