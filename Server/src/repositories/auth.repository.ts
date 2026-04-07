import { injectable } from 'inversify';
import { IAuthRepository } from '../interfaces/repositories/IAuthRepository';
import { IUser, userModel } from '../models/user.model';
import { BaseRepository } from './base.repository';

@injectable()
export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
  constructor() {
    super(userModel);
  }

  async toggleBlockUser(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) throw new Error('user not found');

    const newStatus = !user.is_blocked;
    await this.updateById(userId, { is_blocked: newStatus });
    return newStatus;
  }
}
