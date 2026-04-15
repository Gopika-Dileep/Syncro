import { injectable, inject } from 'inversify';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IGetEmployeesService } from '../../interfaces/services/employee/IGetEmployeesService';
import { GetEmployeesRequestDTO, PaginatedEmployeeResponseDTO } from '../../dto/employee.dto';
import { EmployeeMapper } from '../../mappers/employee.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { EMPLOYEE_MESSAGES } from '../../constants/messages';

@injectable()
export class GetEmployeesService implements IGetEmployeesService {
  constructor(
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
  ) {}

  async execute(userId: string, query: GetEmployeesRequestDTO): Promise<PaginatedEmployeeResponseDTO> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new NotFoundError(EMPLOYEE_MESSAGES.COMPANY_NOT_FOUND);

    const result = await this._employeeRepo.getEmployeesByCompanyId(company._id.toString(), query.page, query.limit, query.search);

    return {
      employees: EmployeeMapper.toResponseList(result.employees),
      total: result.total,
    };
  }
}
