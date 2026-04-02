export interface IPermissionRepository {
  getDefinitionIdsByKeys(keys: string[]): Promise<string[]>;
  createPermission(userId: string, companyId: string, definitionIds: string[]): Promise<void>;
  getPermissionKeysByUserId(userId: string): Promise<string[]>;
  updatePermission(userId: string, definitionIds: string[]): Promise<void>;
}
