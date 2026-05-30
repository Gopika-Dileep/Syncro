import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IGetProfileService } from '../interfaces/services/user/IGetProfileService';
import { IChangePasswordService } from '../interfaces/services/user/IChangePasswordService';
import { IUpdateUserProfileService } from '../interfaces/services/user/IUpdateUserProfileService';
import { USER_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { success } from '../utils/response.utils';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.IGetProfileService) private _getProfileService: IGetProfileService,
    @inject(TYPES.IChangePasswordService) private _changePasswordService: IChangePasswordService,
    @inject(TYPES.IUpdateUserProfileService) private _updateUserProfileService: IUpdateUserProfileService,
  ) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this._getProfileService.execute(req.userId!);
      success(res, profile);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._changePasswordService.execute(req.userId!, req.body);
      success(res, result.message);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._updateUserProfileService.execute(req.userId!, req.body);
      success(res, result, USER_MESSAGES.PROFILE_UPDATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
