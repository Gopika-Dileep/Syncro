import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IPermissionRepository } from '../../interfaces/repositories/IPermissionRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { LoginRequestDTO, AuthResponseDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import { AuthMapper } from '../../mappers/auth.mapper';
import { generateAccessToken, generateRefreshToken } from '../../utils/token.utils';
import { ILoginService } from '../../interfaces/services/auth/ILoginService';

@injectable()
export class LoginService implements ILoginService {
  constructor(
    @inject(TYPES.IAuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.IPermissionRepository) private _permissionRepo: IPermissionRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(data: LoginRequestDTO): Promise<AuthResponseDTO> {
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
}
