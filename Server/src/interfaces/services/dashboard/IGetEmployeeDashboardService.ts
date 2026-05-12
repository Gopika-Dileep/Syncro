import { EmployeeDashboardDTO, DashboardFilter } from '../../../dto/dashboard.dto';

export interface IGetEmployeeDashboardService {
  execute(userId: string, permissions: string[], filter?: DashboardFilter): Promise<EmployeeDashboardDTO>;
}
