import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ResetPasswordRequestDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import { env } from '../../config/env';
import { AUTH_MESSAGES } from '../../constants/messages';
import redis from '../../config/redis';
import { IResetPasswordService } from '../../interfaces/services/auth/IResetPasswordService';

@injectable()
export class ResetPasswordService implements IResetPasswordService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
  ) {}

  async execute(data: ResetPasswordRequestDTO): Promise<{ message: string }> {
    const { token, newPassword } = data;
    const userId = await redis.get(`password_reset:${token}`);
    if (!userId) throw new Error('Invalid or expired reset token');

    const hashed = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await this._authRepo.updateById(userId, { password: hashed });
    await redis.del(`password_reset:${token}`);

    return { message: AUTH_MESSAGES.RESET_SUCCESS };
  }
}
