import { injectable, inject } from 'inversify';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IGetProfileService } from '../../interfaces/services/user/IGetProfileService';
import { UserProfileResponseDTO } from '../../dto/user.dto';
import { UserMapper } from '../../mappers/user.mapper';
import { ICompany } from '../../models/company.model';
import { IPopulatedEmployee } from '../../models/employee.model';
import { TYPES } from '../../di/types';

@injectable()
export class GetProfileService implements IGetProfileService {
  constructor(
    @inject(TYPES.IAuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(userId: string): Promise<UserProfileResponseDTO> {
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
}
