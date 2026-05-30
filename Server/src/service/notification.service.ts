import { injectable, inject } from 'inversify';
import { INotificationService } from '../interfaces/services/INotificationService';
import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';
import { ISocketService } from '../interfaces/services/ISocketService';
import { TYPES } from '../di/types';
import { INotification, NotificationType } from '../models/notification.model';
import mongoose from 'mongoose';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async createNotification(params: { recipientId: string; senderId?: string; type: NotificationType; title: string; message: string; link?: string; relatedEntityId?: string; relatedEntityType?: 'Issue' | 'SubTask' }): Promise<INotification> {
    const notification = await this._notificationRepository.create({
      recipient: new mongoose.Types.ObjectId(params.recipientId),
      sender: params.senderId ? new mongoose.Types.ObjectId(params.senderId) : undefined,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      relatedEntityId: params.relatedEntityId ? new mongoose.Types.ObjectId(params.relatedEntityId) : undefined,
      relatedEntityType: params.relatedEntityType,
    });

    const unreadCount = await this._notificationRepository.getUnreadCount(params.recipientId);

    this._socketService.emitToUser(params.recipientId, 'new_notification', {
      notification,
      unreadCount,
    });

    return notification;
  }

  async getNotifications(recipientId: string, page: number, limit: number): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;
    const notifications = await this._notificationRepository.findByRecipient(recipientId, limit, skip);
    const unreadCount = await this._notificationRepository.getUnreadCount(recipientId);

    return { notifications, total: notifications.length, unreadCount };
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    const notification = await this._notificationRepository.updateById(notificationId, { isRead: true });
    if (notification) {
      const unreadCount = await this._notificationRepository.getUnreadCount(notification.recipient.toString());
      this._socketService.emitToUser(notification.recipient.toString(), 'unread_count_update', { unreadCount });
    }
    return notification;
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this._notificationRepository.markAllAsRead(recipientId);
    this._socketService.emitToUser(recipientId, 'unread_count_update', { unreadCount: 0 });
  }
}
