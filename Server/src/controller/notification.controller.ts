import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { INotificationService } from '../interfaces/services/INotificationService';
import { TYPES } from '../di/types';
import { success } from '../utils/response.utils';
import { NOTIFICATION_MESSAGES } from '../constants/messages';

import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';

@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const employee = await this._employeeRepository.findOne({ user_id: userId });
      if (!employee) {
        return success(res, { notifications: [], total: 0, unreadCount: 0 }, NOTIFICATION_MESSAGES.NO_EMPLOYEE_FOUND);
      }

      const result = await this._notificationService.getNotifications(employee._id.toString(), page, limit);
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
      const employee = await this._employeeRepository.findOne({ user_id: userId });
      if (employee) {
        await this._notificationService.markAllAsRead(employee._id.toString());
      }
      success(res, null, NOTIFICATION_MESSAGES.MARK_ALL_READ_SUCCESS);
    } catch (err) {
      next(err);
    }
  };
}
