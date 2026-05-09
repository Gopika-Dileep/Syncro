import { injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { success } from '../utils/response.utils';
import { handleAsyncError } from '../utils/error.utils';
import { env } from '../config/env';

@injectable()
export class UploadController {
  uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        console.error('Upload failed: No file in request. Headers:', req.headers['content-type']);
        throw new Error('No file uploaded');
      }

      const fileUrl = `${env.BACKEND_URL}/uploads/${req.file.filename}`;

      success(
        res,
        {
          file_url: fileUrl,
          file_name: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        'File uploaded successfully',
      );
    } catch (error) {
      console.error('Upload error:', error);
      handleAsyncError(error, next);
    }
  };

  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new Error('No files uploaded');
      }

      const uploadedFiles = files.map((file) => ({
        file_url: `${env.BACKEND_URL}/uploads/${file.filename}`,
        file_name: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }));

      success(res, uploadedFiles, 'Files uploaded successfully');
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
