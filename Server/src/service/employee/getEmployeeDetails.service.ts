import { injectable, inject } from 'inversify';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IPermissionRepository } from '../../interfaces/repositories/IPermissionRepository';
import { IGetEmployeeDetailsService } from '../../interfaces/services/employee/IGetEmployeeDetailsService';
import { EmployeeResponseDTO } from '../../dto/employee.dto';
import { EmployeeMapper } from '../../mappers/employee.mapper';
import { TYPES } from '../../di/types';
import { EMPLOYEE_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class GetEmployeeDetailsService implements IGetEmployeeDetailsService {
  constructor(
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.IPermissionRepository) private _permissionRepo: IPermissionRepository,
  ) {}

  async execute(userId: string): Promise<EmployeeResponseDTO> {
    const employee = await this._employeeRepo.findByUserId(userId);
    if (!employee) throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);

    const permsKeys = await this._permissionRepo.getPermissionKeysByUserId(userId);
    return EmployeeMapper.toResponseDTO(employee, permsKeys);
  }
}
