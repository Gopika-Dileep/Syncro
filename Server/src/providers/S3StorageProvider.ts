import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { injectable } from 'inversify';
import { IStorageProvider } from '../interfaces/providers/IStorageProvider';

@injectable()
export class S3StorageProvider implements IStorageProvider {
  private s3Config: S3Client;

  constructor() {
    this.s3Config = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }

  getStorage() {
    return multerS3({
      s3: this.s3Config,
      bucket: process.env.AWS_S3_BUCKET_NAME as string,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'uploads/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
  }
}
