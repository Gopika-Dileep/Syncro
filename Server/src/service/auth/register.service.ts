import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { RegisterRequestDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import { env } from '../../config/env';
import { AUTH_MESSAGES } from '../../constants/messages';
import redis from '../../config/redis';
import { sendOtpEmail } from '../../utils/email.utils';
import { IRegisterService } from '../../interfaces/services/auth/IRegisterService';

@injectable()
export class RegisterService implements IRegisterService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
  ) {}

  async execute(data: RegisterRequestDTO): Promise<{ message: string }> {
    const { name, email, password, companyName } = data;
    const existing = await this._authRepo.findOne({ email });
    if (existing) throw new Error('email already exist');

    const hashed = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const user = await this._authRepo.create({ name, email, password: hashed, role: 'company' });

    await this._companyRepo.create({ user_id: user._id.toString(), name: companyName });

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log('otp', otp);
    await redis.set(`otp:${email}`, otp, 'EX', env.OTP_EXPIRY);
    await sendOtpEmail(email, otp);

    return { message: AUTH_MESSAGES.REGISTRATION_SUCCESS };
  }
}
