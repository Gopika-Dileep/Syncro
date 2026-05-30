import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { INotificationService } from '../interfaces/services/INotificationService';
import { TYPES } from '../di/types';
import { success } from '../utils/response.utils';
import { NOTIFICATION_MESSAGES } from '../constants/messages';

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this._notificationService.getNotifications(userId, page, limit);
      success(res, result, NOTIFICATION_MESSAGES.FETCH_SUCCESS);
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await this._notificationService.markAsRead(id as string);
      success(res, notification, NOTIFICATION_MESSAGES.MARK_READ_SUCCESS);
    } catch (err) {
      next(err);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      await this._notificationService.markAllAsRead(userId);
      success(res, null, NOTIFICATION_MESSAGES.MARK_ALL_READ_SUCCESS);
    } catch (err) {
      next(err);
    }
  };
}
