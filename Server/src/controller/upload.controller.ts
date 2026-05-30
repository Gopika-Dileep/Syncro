import { injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { success } from '../utils/response.utils';
import { handleAsyncError } from '../utils/error.utils';
import { env } from '../config/env';
import { UPLOAD_MESSAGES } from '../constants/messages';

interface S3File extends Express.Multer.File {
  location: string;
}

@injectable()
export class UploadController {
  uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        console.error('Upload failed: No file in request. Headers:', req.headers['content-type']);
        throw new Error(UPLOAD_MESSAGES.NO_FILE_UPLOADED);
      }

      const s3File = req.file as S3File;
      const fileUrl = s3File.location;

      success(
        res,
        {
          file_url: fileUrl,
          file_name: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        UPLOAD_MESSAGES.UPLOAD_SUCCESS,
      );
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new Error(UPLOAD_MESSAGES.NO_FILES_UPLOADED);
      }

      const uploadedFiles = files.map((file) => {
        const s3File = file as S3File;
        return {
          file_url: s3File.location,
          file_name: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        };
      });

      success(res, uploadedFiles, UPLOAD_MESSAGES.UPLOAD_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
