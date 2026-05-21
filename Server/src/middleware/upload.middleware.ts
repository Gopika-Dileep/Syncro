import multer from 'multer';
import { container } from '../di/inversify.config';
import { TYPES } from '../di/types';
import { IStorageProvider } from '../interfaces/providers/IStorageProvider';

const storageProvider = container.get<IStorageProvider>(TYPES.IStorageProvider);

export const upload = multer({
  storage: storageProvider.getStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
