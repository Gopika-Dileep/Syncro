import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ResendOtpRequestDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import { env } from '../../config/env';
import { AUTH_MESSAGES } from '../../constants/messages';
import redis from '../../config/redis';
import { sendOtpEmail } from '../../utils/email.utils';
import { IResendOtpService } from '../../interfaces/services/auth/IResendOtpService';

@injectable()
export class ResendOtpService implements IResendOtpService {
  constructor(
    @inject(TYPES.IAuthRepository) private _authRepo: IAuthRepository,
  ) {}

  async execute(data: ResendOtpRequestDTO): Promise<{ message: string }> {
    const { email } = data;
    const user = await this._authRepo.findOne({ email });
    if (!user) throw new Error('User not found');
    if (user.is_verified) throw new Error('user is already verified');

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log('otp', otp);
    await redis.set(`otp:${email}`, otp, 'EX', env.OTP_EXPIRY);
    await sendOtpEmail(email, otp);

    return { message: AUTH_MESSAGES.OTP_RESEND_SUCCESS };
  }
}
