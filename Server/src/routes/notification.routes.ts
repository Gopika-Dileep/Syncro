import { Router } from 'express';
import { container } from '../di/inversify.config';
import { TYPES } from '../di/types';
import { NotificationController } from '../controller/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ENDPOINTS } from '../constants/endpoints';

export class NotificationRouter {
  public router: Router;
  private _notificationController: NotificationController;

  constructor() {
    this.router = Router();
    this._notificationController = container.get<NotificationController>(TYPES.NotificationController);
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.get(ENDPOINTS.NOTIFICATIONS.ROOT, authMiddleware, this._notificationController.getNotifications);
    this.router.patch(ENDPOINTS.NOTIFICATIONS.MARK_AS_READ, authMiddleware, this._notificationController.markAsRead);
    this.router.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, authMiddleware, this._notificationController.markAllAsRead);
  }
}
