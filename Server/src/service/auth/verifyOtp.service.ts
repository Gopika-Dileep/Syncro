import { injectable, inject } from 'inversify';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IPermissionRepository } from '../../interfaces/repositories/IPermissionRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { VerifyOtpRequestDTO, AuthResponseDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import redis from '../../config/redis';
import { AuthMapper } from '../../mappers/auth.mapper';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.utils';
import { IVerifyOtpService } from '../../interfaces/services/auth/IVerifyOtpService';

@injectable()
export class VerifyOtpService implements IVerifyOtpService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.PermissionRepository) private _permissionRepo: IPermissionRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(data: VerifyOtpRequestDTO): Promise<AuthResponseDTO> {
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
}
