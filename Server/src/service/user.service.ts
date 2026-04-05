import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { IAuthRepository } from '../interfaces/repositories/IAuthRepository';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';
import { ICompany } from '../models/company.model';
import { IPopulatedEmployee } from '../models/employee.model';
import { IUserService } from '../interfaces/services/IUserService';
import { ChangePasswordRequestDTO, UpdateProfileRequestDTO, UserProfileResponseDTO } from '../dto/user.dto';
import { UserMapper } from '../mappers/user.mapper';
import { TYPES } from '../di/types';
import { env } from '../config/env';
import { USER_MESSAGES } from '../constants/messages';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async getProfile(userId: string): Promise<UserProfileResponseDTO> {
    const user = await this._authRepo.findById(userId);
    if (!user) throw new Error('User not found');

    let company: ICompany | null = null;
    let employee: IPopulatedEmployee | null = null;

    if (user.role === 'company') {
      company = await this._companyRepo.findOne({ user_id: userId });
    } else if (user.role === 'employee') {
      employee = await this._employeeRepo.findByUserId(userId);
    }

    return UserMapper.toUserProfileDTO(user, company, employee);
  }

  async changePassword(userId: string, data: ChangePasswordRequestDTO): Promise<{ message: string }> {
    const user = await this._authRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new Error("Current password doesn't match");

    const hashed = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS);
    await this._authRepo.updateById(userId, { password: hashed });

    return { message: USER_MESSAGES.PASSWORD_CHANGE_SUCCESS };
  }

  async updateUserProfile(userId: string, data: UpdateProfileRequestDTO): Promise<UserProfileResponseDTO> {
    const userUpdate = UserMapper.toUserUpdateEntity(data);
    if (Object.keys(userUpdate).length > 0) await this._authRepo.updateById(userId, { $set: userUpdate });

    const employeeUpdate = UserMapper.toEmployeeUpdateEntity(data);
    if (Object.keys(employeeUpdate).length > 0) await this._employeeRepo.updateOne({ user_id: userId }, { $set: employeeUpdate });

    return this.getProfile(userId);
  }
}
