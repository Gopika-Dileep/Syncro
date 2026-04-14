import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IGetProfileService } from '../interfaces/services/user/IGetProfileService';
import { IChangePasswordService } from '../interfaces/services/user/IChangePasswordService';
import { IUpdateUserProfileService } from '../interfaces/services/user/IUpdateUserProfileService';
import { HttpStatus } from '../enums/HttpStatus';
import { USER_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.GetProfileService) private _getProfileService: IGetProfileService,
    @inject(TYPES.ChangePasswordService) private _changePasswordService: IChangePasswordService,
    @inject(TYPES.UpdateUserProfileService) private _updateUserProfileService: IUpdateUserProfileService,
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this._getProfileService.execute(req.userId!);
      res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._changePasswordService.execute(req.userId!, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._updateUserProfileService.execute(req.userId!, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: USER_MESSAGES.PROFILE_UPDATE_SUCCESS, data: result });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
