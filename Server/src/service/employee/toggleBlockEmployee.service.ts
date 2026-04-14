import { injectable, inject } from 'inversify';
import { IAuthRepository } from '../../interfaces/repositories/IAuthRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IToggleBlockEmployeeService } from '../../interfaces/services/employee/IToggleBlockEmployeeService';
import { TYPES } from '../../di/types';

@injectable()
export class ToggleBlockEmployeeService implements IToggleBlockEmployeeService {
  constructor(
    @inject(TYPES.IAuthRepository) private _authRepo: IAuthRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
  ) {}

  async execute(userId: string, empUserId: string): Promise<boolean> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');
    return this._authRepo.toggleBlockUser(empUserId);
  }
}
