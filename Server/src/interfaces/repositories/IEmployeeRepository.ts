import { IEmployee, IPopulatedEmployee } from '../../models/employee.model';
import { IBaseRepository } from './IBaseRepository';

export interface IEmployeeRepository extends IBaseRepository<IEmployee> {
  getEmployeesByCompanyId(companyId: string, page: number, limit: number, search: string): Promise<{ employees: IPopulatedEmployee[]; total: number }>;
  findByUserId(userId: string): Promise<IPopulatedEmployee | null>;
}
