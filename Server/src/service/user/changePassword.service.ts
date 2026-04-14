import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IChangePasswordService } from '../../interfaces/services/user/IChangePasswordService';
import { ChangePasswordRequestDTO } from '../../dto/user.dto';
import { TYPES } from '../../di/types';
import { env } from '../../config/env';
import { USER_MESSAGES } from '../../constants/messages';

@injectable()
export class ChangePasswordService implements IChangePasswordService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
  ) {}

  async execute(userId: string, data: ChangePasswordRequestDTO): Promise<{ message: string }> {
    const user = await this._authRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new Error("Current password doesn't match");

    const hashed = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS);
    await this._authRepo.updateById(userId, { password: hashed });

    return { message: USER_MESSAGES.PASSWORD_CHANGE_SUCCESS };
  }
}
