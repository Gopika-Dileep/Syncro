import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ForgotPasswordRequestDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import { env } from '../../config/env';
import { AUTH_MESSAGES } from '../../constants/messages';
import redis from '../../config/redis';
import { sendPasswordResetEmail } from '../../utils/email.utils';
import { IForgotPasswordService } from '../../interfaces/services/auth/IForgotPasswordService';

@injectable()
export class ForgotPasswordService implements IForgotPasswordService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
  ) {}

  async execute(data: ForgotPasswordRequestDTO): Promise<{ message: string }> {
    const { email } = data;
    const user = await this._authRepo.findOne({ email });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redis.set(`password_reset:${resetToken}`, user._id.toString(), 'EX', env.PASSWORD_RESET_EXPIRY);
    await sendPasswordResetEmail(user.email, resetToken);

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS };
  }
}
