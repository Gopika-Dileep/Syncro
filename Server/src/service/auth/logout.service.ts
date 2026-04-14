import { injectable, inject } from 'inversify';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { TYPES } from '../../di/types';
import { verifyRefreshToken } from '../../utils/token.utils';
import { ILogoutService } from '../../interfaces/services/auth/ILogoutService';

@injectable()
export class LogoutService implements ILogoutService {
  constructor(
    @inject(TYPES.AuthRepository) private _authRepo: IAuthRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const decoded = verifyRefreshToken(refreshToken);
    await this._authRepo.updateById(decoded.id, { refreshToken: null });
  }
}
