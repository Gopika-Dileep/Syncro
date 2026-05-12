import { injectable, inject } from 'inversify';
import { IGetUnassignedEmployeesService } from '../../interfaces/services/employee/IGetUnassignedEmployeesService';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IPopulatedEmployee } from '../../models/employee.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { COMPANY_MESSAGES } from '../../constants/messages';
import { Types } from 'mongoose';

@injectable()
export class GetUnassignedEmployeesService implements IGetUnassignedEmployeesService {
  constructor(
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
  ) {}

  async execute(userId: string, search: string = ''): Promise<IPopulatedEmployee[]> {
    const employee = await this._employeeRepo.findByUserId(userId);
    let companyId: string;

    if (employee) {
      companyId = (employee.company_id as Record<string, unknown>)?._id?.toString() || employee.company_id.toString();
    } else {
      const company = await this._companyRepo.findOne({ user_id: new Types.ObjectId(userId) });
      if (!company) throw new NotFoundError(COMPANY_MESSAGES.COMPANY_NOT_FOUND);
      companyId = company._id.toString();
    }

    return await this._employeeRepo.findUnassignedByCompanyId(companyId, search);
  }
}
