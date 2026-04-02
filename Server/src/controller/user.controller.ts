import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { IUserService } from '../interfaces/services/IUserService';
import { HttpStatus } from '../enums/HttpStatus';
import { USER_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private _userService: IUserService) { }

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const profile = await this._userService.getProfile(req.userId!);
      res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : USER_MESSAGES.PROFILE_FETCH_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._userService.changePassword(req.userId!, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : USER_MESSAGES.PASSWORD_CHANGE_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._userService.updateUserProfile(req.userId!, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: USER_MESSAGES.PROFILE_UPDATE_SUCCESS, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : USER_MESSAGES.PROFILE_UPDATE_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };
}
