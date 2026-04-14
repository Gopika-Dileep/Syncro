import { injectable, inject } from 'inversify';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IPermissionRepository } from '../../interfaces/repositories/IPermissionRepository';
import { IUpdateEmployeeDetailsService } from '../../interfaces/services/employee/IUpdateEmployeeDetailsService';
import { IGetEmployeeDetailsService } from '../../interfaces/services/employee/IGetEmployeeDetailsService';
import { UpdateEmployeeRequestDTO, EmployeeResponseDTO } from '../../dto/employee.dto';
import { EmployeeMapper } from '../../mappers/employee.mapper';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { TYPES } from '../../di/types';
import { parseDate } from '../../utils/parseDate.utils';

@injectable()
export class UpdateEmployeeDetailsService implements IUpdateEmployeeDetailsService {
  constructor(
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.PermissionRepository) private _permissionRepo: IPermissionRepository,
    @inject(TYPES.GetEmployeeDetailsService) private _getEmployeeDetailsService: IGetEmployeeDetailsService,
  ) {}

  async execute(userId: string, data: UpdateEmployeeRequestDTO): Promise<EmployeeResponseDTO> {
    if (data.name) await this._authRepo.updateById(userId, { name: data.name });

    if (data.permissions) {
      const selectedKeys = PermissionMapper.toFlatKeys(data.permissions);
      const definitionIds = await this._permissionRepo.getDefinitionIdsByKeys(selectedKeys);
      await this._permissionRepo.updateOne({ user_id: userId }, { $set: { permissions: definitionIds } });
    }

    const joiningDate = data.date_of_joining ? parseDate(data.date_of_joining) : undefined;
    const dateOfBirth = data.date_of_birth ? parseDate(data.date_of_birth) : undefined;
    const employeeEntity = EmployeeMapper.toUpdate(data, joiningDate, dateOfBirth);

    const updatedEmployee = await this._employeeRepo.updateOne({ user_id: userId }, { $set: employeeEntity });
    if (!updatedEmployee) throw new Error('failed to update employee details');

    return this._getEmployeeDetailsService.execute(userId);
  }
}
