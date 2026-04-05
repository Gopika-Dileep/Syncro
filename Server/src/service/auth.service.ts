import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IAuthService } from '../interfaces/services/IAuthService';
import { IAuthRepository } from '../interfaces/repositories/IAuthRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.utils';
import redis from '../config/redis';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/email.utils';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { IPermissionRepository } from '../interfaces/repositories/IPermissionRepository';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';
import { RegisterRequestDTO, LoginRequestDTO, VerifyOtpRequestDTO, ResendOtpRequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO, AuthResponseDTO } from '../dto/auth.dto';
import { AuthMapper } from '../mappers/auth.mapper';
import { TYPES } from '../di/types';
import { env } from '../config/env';
import { AUTH_MESSAGES } from '../constants/messages';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.PermissionRepository) private _permissionRepo: IPermissionRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async registration(data: RegisterRequestDTO): Promise<{ message: string }> {
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

  async verifyOtp(data: VerifyOtpRequestDTO): Promise<AuthResponseDTO> {
    const { email, otp } = data;
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) throw new Error('Invalid or expired OTP');

    const user = await this._authRepo.findOne({ email });
    if (!user) throw new Error('User not found');

    await this._authRepo.updateById(user._id.toString(), { is_verified: true });
    if (user.is_blocked) throw new Error('Your account has been blocked. Please contact support.');

    let permissions: string[] = [];
    let designation: string | null = null;
    let companyName: string | null = null;

    if (user.role === 'employee') {
      const employeeData = await this._employeeRepo.findByUserId(user._id.toString());
      designation = employeeData?.designation || null;
      if (employeeData && employeeData.company_id) companyName = employeeData.company_id.name;
      permissions = await this._permissionRepo.getPermissionKeysByUserId(user._id.toString());
    } else {
      const company = await this._companyRepo.findOne({ user_id: user._id.toString() });
      companyName = company?.name || null;
    }

    const userDTO = AuthMapper.toUserDTO(user, designation, companyName);
    const accessToken = generateAccessToken(userDTO.id, userDTO.role, permissions, userDTO.name, userDTO.designation, userDTO.companyName);
    const refreshToken = generateRefreshToken(userDTO.id);

    await this._authRepo.updateById(user._id.toString(), { refreshToken });
    await redis.del(`otp:${email}`);
    return AuthMapper.toAuthResponseDTO(accessToken, refreshToken, userDTO, permissions);
  }

  async resendOtp(data: ResendOtpRequestDTO): Promise<{ message: string }> {
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

  async login(data: LoginRequestDTO): Promise<AuthResponseDTO> {
    const { email, password } = data;
    const user = await this._authRepo.findOne({ email });
    if (!user) throw new Error('user not found');
    if (!user.is_verified) throw new Error('User is not verified');
    if (user.is_blocked) throw new Error('Your account has been blocked. Please contact support.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Password is wrong');

    let permissions: string[] = [];
    let designation: string | null = null;
    let companyName: string | null = null;

    if (user.role === 'employee') {
      const employeeData = await this._employeeRepo.findByUserId(user._id.toString());
      designation = employeeData?.designation || null;
      if (employeeData && employeeData.company_id) companyName = employeeData.company_id.name;
      permissions = await this._permissionRepo.getPermissionKeysByUserId(user._id.toString());
    } else {
      const company = await this._companyRepo.findOne({ user_id: user._id.toString() });
      companyName = company?.name || null;
    }

    const userDTO = AuthMapper.toUserDTO(user, designation, companyName);
    const accessToken = generateAccessToken(userDTO.id, userDTO.role, permissions, userDTO.name, userDTO.designation, userDTO.companyName);
    const refreshToken = generateRefreshToken(userDTO.id);

    await this._authRepo.updateById(user._id.toString(), { refreshToken });
    return AuthMapper.toAuthResponseDTO(accessToken, refreshToken, userDTO, permissions);
  }

  async refresh(refreshToken: string): Promise<Omit<AuthResponseDTO, 'refreshToken'>> {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await this._authRepo.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) throw new Error('invalid refresh token');
    if (user.is_blocked) throw new Error('Your account has been blocked. Please contact support.');

    let permissions: string[] = [];
    let designation: string | null = null;
    let companyName: string | null = null;

    if (user.role === 'employee') {
      const employeeData = await this._employeeRepo.findByUserId(user._id.toString());
      designation = employeeData?.designation || null;
      if (employeeData && employeeData.company_id) companyName = employeeData.company_id.name;
      permissions = await this._permissionRepo.getPermissionKeysByUserId(user._id.toString());
    } else {
      const company = await this._companyRepo.findOne({ user_id: user._id.toString() });
      companyName = company?.name || null;
    }

    const userDTO = AuthMapper.toUserDTO(user, designation, companyName);
    const accessToken = generateAccessToken(userDTO.id, userDTO.role, permissions, userDTO.name, userDTO.designation, userDTO.companyName);
    return AuthMapper.toRefreshResponseDTO(accessToken, userDTO, permissions);
  }

  async logout(refreshToken: string): Promise<void> {
    const decoded = verifyRefreshToken(refreshToken);
    await this._authRepo.updateById(decoded.id, { refreshToken: null });
  }

  async forgotPassword(data: ForgotPasswordRequestDTO): Promise<{ message: string }> {
    const { email } = data;
    const user = await this._authRepo.findOne({ email });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redis.set(`password_reset:${resetToken}`, user._id.toString(), 'EX', env.PASSWORD_RESET_EXPIRY);
    await sendPasswordResetEmail(user.email, resetToken);

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS };
  }

  async resetPassword(data: ResetPasswordRequestDTO): Promise<{ message: string }> {
    const { token, newPassword } = data;
    const userId = await redis.get(`password_reset:${token}`);
    if (!userId) throw new Error('Invalid or expired reset token');

    const hashed = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await this._authRepo.updateById(userId, { password: hashed });
    await redis.del(`password_reset:${token}`);

    return { message: AUTH_MESSAGES.RESET_SUCCESS };
  }
}
