import { injectable, inject } from 'inversify';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';
import { IEmployeeService } from '../interfaces/services/IEmployeeService';
import { EmployeeResponseDTO, PaginatedEmployeeResponseDTO, AddEmployeeRequestDTO, GetEmployeesRequestDTO, UpdateEmployeeRequestDTO } from '../dto/employee.dto';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmployeeInvitationEmail } from '../utils/email.utils';
import { parseDate } from '../utils/parseDate.utils';
import { IAuthRepository } from '../interfaces/repositories/IAuthRepository';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { IPermissionRepository } from '../interfaces/repositories/IPermissionRepository';
import { PermissionMapper } from '../mappers/permission.mapper';
import { EmployeeMapper } from '../mappers/employee.mapper';
import { TYPES } from '../di/types';
import { env } from '../config/env';
import { EMPLOYEE_MESSAGES } from '../constants/messages';

@injectable()
export class EmployeeService implements IEmployeeService {
  constructor(
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.PermissionRepository) private _permissionRepo: IPermissionRepository,
  ) {}

  async addEmployee(userId: string, data: AddEmployeeRequestDTO): Promise<{ message: string }> {
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
    const employeeEntity = EmployeeMapper.toCreateEntity(data, joiningDate, dateOfBirth);

    await this._employeeRepo.create({ user_id: user._id.toString(), company_id: company._id.toString(), ...employeeEntity });
    await sendEmployeeInvitationEmail(data.email, data.name, company.name, randomPassword);

    return { message: EMPLOYEE_MESSAGES.ADD_SUCCESS };
  }

  async getEmployees(userId: string, query: GetEmployeesRequestDTO): Promise<PaginatedEmployeeResponseDTO> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');

    const result = await this._employeeRepo.getEmployeesByCompanyId(company._id.toString(), query.page, query.limit, query.search);

    return {
      employees: EmployeeMapper.toResponseList(result.employees),
      total: result.total,
    };
  }

  async toggleBlockEmployee(userId: string, empUserId: string): Promise<boolean> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');
    return this._authRepo.toggleBlockUser(empUserId);
  }

  async getEmployeeDetails(userId: string): Promise<EmployeeResponseDTO> {
    const employee = await this._employeeRepo.findByUserId(userId);
    if (!employee) throw new Error('employee not found');

    const permsKeys = await this._permissionRepo.getPermissionKeysByUserId(userId);
    return EmployeeMapper.toResponseDTO(employee, permsKeys);
  }

  async updateEmployeeDetails(userId: string, data: UpdateEmployeeRequestDTO): Promise<EmployeeResponseDTO> {
    if (data.name) await this._authRepo.updateById(userId, { name: data.name });

    if (data.permissions) {
      const selectedKeys = PermissionMapper.toFlatKeys(data.permissions);
      const definitionIds = await this._permissionRepo.getDefinitionIdsByKeys(selectedKeys);
      await this._permissionRepo.updateOne({ user_id: userId }, { $set: { permissions: definitionIds } });
    }

    const joiningDate = data.date_of_joining ? parseDate(data.date_of_joining) : undefined;
    const dateOfBirth = data.date_of_birth ? parseDate(data.date_of_birth) : undefined;
    const employeeEntity = EmployeeMapper.toUpdateEntity(data, joiningDate, dateOfBirth);

    const updatedEmployee = await this._employeeRepo.updateOne({ user_id: userId }, { $set: employeeEntity });
    if (!updatedEmployee) throw new Error('failed to update employee details');

    return this.getEmployeeDetails(userId);
  }
}
