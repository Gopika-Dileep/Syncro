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
    const existingDefinitions = await permissionDefinitionModel.find({ permission_key: { $in: keys } });
    const existingKeys = existingDefinitions.map((d) => d.permission_key);
    const missingKeys = keys.filter((k) => !existingKeys.includes(k));

    if (missingKeys.length > 0) {
      for (const key of missingKeys) {
        const parts = key.split(':');
        let module = 'unknown';
        let action = 'unknown';
        let scope = 'any';

        if (parts.length === 3) {
          [module, action, scope] = parts as [string, string, string];
        } else if (parts.length === 2) {
          [module, action] = parts as [string, string];
        } else if (parts.length === 4) {
          module = parts[0] as string;
          action = parts[1] as string;
          scope = parts.slice(2).join(':');
        }

        const definition = await permissionDefinitionModel.findOneAndUpdate({ permission_key: key }, { $setOnInsert: { module, action, scope, permission_key: key } }, { upsert: true, new: true });
        if (definition) existingDefinitions.push(definition);
      }
    }

    return existingDefinitions.map((d) => d._id.toString());
  }

  async getPermissionKeysByUserId(userId: string): Promise<string[]> {
    const userPerm = await permissionModel.findOne({ user_id: userId }).populate<{ permissions: IpermissionDefinition[] }>('permissions');
    if (!userPerm || !userPerm.permissions) return [];

    return userPerm.permissions.map((p) => p.permission_key);
  }
}
