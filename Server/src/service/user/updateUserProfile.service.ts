import { injectable, inject } from 'inversify';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IUpdateUserProfileService } from '../../interfaces/services/user/IUpdateUserProfileService';
import { IGetProfileService } from '../../interfaces/services/user/IGetProfileService';
import { UpdateProfileRequestDTO, UserProfileResponseDTO } from '../../dto/user.dto';
import { UserMapper } from '../../mappers/user.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class UpdateUserProfileService implements IUpdateUserProfileService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.GetProfileService) private _getProfileService: IGetProfileService,
  ) {}

  async execute(userId: string, data: UpdateProfileRequestDTO): Promise<UserProfileResponseDTO> {
    const userUpdate = UserMapper.toUserUpdateEntity(data);
    if (userUpdate && Object.keys(userUpdate).length > 0) await this._authRepo.updateById(userId, { $set: userUpdate });

    const employeeUpdate = UserMapper.toEmployeeUpdateEntity(data);
    if (employeeUpdate && Object.keys(employeeUpdate).length > 0) await this._employeeRepo.updateOne({ user_id: userId }, { $set: employeeUpdate });

    return this._getProfileService.execute(userId);
  }
}
