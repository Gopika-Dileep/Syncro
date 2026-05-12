import { IPopulatedEmployee } from '../../../models/employee.model';

export interface IGetUnassignedEmployeesService {
  execute(userId: string, search?: string): Promise<IPopulatedEmployee[]>;
}
