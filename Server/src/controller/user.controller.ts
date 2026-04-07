import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../interfaces/services/IUserService';
import { HttpStatus } from '../enums/HttpStatus';
import { USER_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private _userService: IUserService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this._userService.getProfile(req.userId!);
      res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._userService.changePassword(req.userId!, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._userService.updateUserProfile(req.userId!, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: USER_MESSAGES.PROFILE_UPDATE_SUCCESS, data: result });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
