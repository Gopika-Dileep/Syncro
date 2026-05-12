import { CompanyDashboardDTO } from '../../../dto/dashboard.dto';

export interface IGetCompanyDashboardService {
  execute(userId: string): Promise<CompanyDashboardDTO>;
}
