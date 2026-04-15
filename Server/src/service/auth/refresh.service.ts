import { injectable, inject } from 'inversify';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { IPermissionRepository } from '../../interfaces/repositories/IPermissionRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { AuthResponseDTO } from '../../dto/auth.dto';
import { TYPES } from '../../di/types';
import { AuthMapper } from '../../mappers/auth.mapper';
import { generateAccessToken, verifyRefreshToken } from '../../utils/token.utils';
import { IRefreshService } from '../../interfaces/services/auth/IRefreshService';
import { ForbiddenError, UnauthorizedError } from '../../errors/AppError';
import { AUTH_MESSAGES } from '../../constants/messages';

@injectable()
export class RefreshService implements IRefreshService {
  constructor(
    @inject(TYPES.IAuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.IPermissionRepository) private _permissionRepo: IPermissionRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(refreshToken: string): Promise<Omit<AuthResponseDTO, 'refreshToken'>> {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await this._authRepo.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedError(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    if (user.is_blocked) throw new ForbiddenError(AUTH_MESSAGES.ACCOUNT_BLOCKED);

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
}
