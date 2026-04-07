import { injectable } from 'inversify';
import { IPermissionRepository } from '../interfaces/repositories/IPermissionRepository';
import { IpermissionDefinition, permissionDefinitionModel } from '../models/permissionDefinition.model';
import { permissionModel, IPermission } from '../models/permission.model';
import { BaseRepository } from './base.repository';

@injectable()
export class PermissionRepository extends BaseRepository<IPermission> implements IPermissionRepository {
  constructor() {
    super(permissionModel);
  }

  async getDefinitionIdsByKeys(keys: string[]): Promise<string[]> {
    const definitions = await permissionDefinitionModel.find({ permission_key: { $in: keys } });
    return definitions.map((d) => d._id.toString());
  }

  async getPermissionKeysByUserId(userId: string): Promise<string[]> {
    const userPerm = await permissionModel.findOne({ user_id: userId }).populate<{ permissions: IpermissionDefinition[] }>('permissions');
    if (!userPerm || !userPerm.permissions) return [];

    return userPerm.permissions.map((p) => p.permission_key);
  }
}
