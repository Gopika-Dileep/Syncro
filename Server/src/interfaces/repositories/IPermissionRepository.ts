import { IBaseRepository } from './IBaseRepository';
import { IPermission } from '../../models/permission.model';

export interface IPermissionRepository extends IBaseRepository<IPermission> {
  getDefinitionIdsByKeys(keys: string[]): Promise<string[]>;
  getPermissionKeysByUserId(userId: string): Promise<string[]>;
}
