import { Router } from 'express';
import { container } from '../di/inversify.config';
import { UploadController } from '../controller/upload.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { ENDPOINTS } from '../constants/endpoints';

const uploadController = container.get<UploadController>(TYPES.UploadController);

export class UploadRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.post(ENDPOINTS.UPLOAD.SINGLE, authMiddleware, upload.single('file'), uploadController.uploadFile);
    this.router.post(ENDPOINTS.UPLOAD.MULTIPLE, authMiddleware, upload.array('files', 10), uploadController.uploadMultipleFiles);
  }
}
