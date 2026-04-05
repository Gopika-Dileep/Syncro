import { IUser } from '../../models/user.model';
import { IBaseRepository } from './IBaseRepository';

export interface IAuthRepository extends IBaseRepository<IUser> {
  toggleBlockUser(userId: string): Promise<boolean>;
}
