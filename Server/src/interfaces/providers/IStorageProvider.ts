import { StorageEngine } from 'multer';

export interface IStorageProvider {
  getStorage(): StorageEngine;
}
