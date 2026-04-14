import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IPermissionRepository } from '../../interfaces/repositories/IPermissionRepository';
import { IAddEmployeeService } from '../../interfaces/services/employee/IAddEmployeeService';
import { AddEmployeeRequestDTO } from '../../dto/employee.dto';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { EmployeeMapper } from '../../mappers/employee.mapper';
import { TYPES } from '../../di/types';
import { env } from '../../config/env';
import { EMPLOYEE_MESSAGES } from '../../constants/messages';
import { sendEmployeeInvitationEmail } from '../../utils/email.utils';
import { parseDate } from '../../utils/parseDate.utils';

@injectable()
export class AddEmployeeService implements IAddEmployeeService {
  constructor(
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.PermissionRepository) private _permissionRepo: IPermissionRepository,
  ) {}

  async execute(userId: string, data: AddEmployeeRequestDTO): Promise<{ message: string }> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');

    const existingUser = await this._authRepo.findOne({ email: data.email });
    if (existingUser) throw new Error('employee with this email already exists');

    const randomPassword = crypto.randomBytes(6).toString('hex');
    const hashedpassword = await bcrypt.hash(randomPassword, env.BCRYPT_SALT_ROUNDS);

    const user = await this._authRepo.create({ name: data.name, email: data.email, password: hashedpassword, role: 'employee' });
    await this._authRepo.updateById(user._id.toString(), { is_verified: true });

    const selectedKeys = PermissionMapper.toFlatKeys(data.permissions);
    const definitionIds = await this._permissionRepo.getDefinitionIdsByKeys(selectedKeys);
    await this._permissionRepo.create({ user_id: user._id.toString(), company_id: company._id.toString(), permissions: definitionIds });

    const joiningDate = parseDate(data.date_of_joining);
    const dateOfBirth = parseDate(data.date_of_birth);
    const employeeEntity = EmployeeMapper.toCreate(data, joiningDate, dateOfBirth);

    await this._employeeRepo.create({ user_id: user._id.toString(), company_id: company._id.toString(), ...employeeEntity });
    await sendEmployeeInvitationEmail(data.email, data.name, company.name, randomPassword);

    return { message: EMPLOYEE_MESSAGES.ADD_SUCCESS };
  }
}
