import { EmployeeDashboardDTO } from '../../../dto/dashboard.dto';

export interface IGetEmployeeDashboardService {
  execute(userId: string, permissions: string[]): Promise<EmployeeDashboardDTO>;
}
