import { injectable } from 'inversify';
import { IPermissionRepository } from '../interfaces/repositories/IPermissionRepository';
import { IpermissionDefinition, permissionDefinitionModel } from '../models/permissionDefinition.model';
import { permissionModel } from '../models/permission.model';

@injectable()
export class PermissionRepository implements IPermissionRepository {
  async getDefinitionIdsByKeys(keys: string[]): Promise<string[]> {
    const definitions = await permissionDefinitionModel.find({ permission_key: { $in: keys } });
    return definitions.map((d) => d._id.toString());
  }

  async createPermission(userId: string, companyId: string, definitionIds: string[]): Promise<void> {
    await permissionModel.create({ user_id: userId, company_id: companyId, permissions: definitionIds });
  }

  async getPermissionKeysByUserId(userId: string): Promise<string[]> {
    const userPerm = await permissionModel
      .findOne({ user_id: userId })
      .populate<{ permissions: IpermissionDefinition[] }>('permissions');
    if (!userPerm || !userPerm.permissions) return [];

    return userPerm.permissions.map((p) => p.permission_key);
  }

  async updatePermission(userId: string, definitionIds: string[]): Promise<void> {
    await permissionModel.findOneAndUpdate({ user_id: userId }, { $set: { permissions: definitionIds } });
  }
}
