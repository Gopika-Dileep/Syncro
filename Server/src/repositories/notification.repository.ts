import { injectable } from 'inversify';
import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';
import { Notification, INotification } from '../models/notification.model';
import { BaseRepository } from './base.repository';

@injectable()
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor() {
    super(Notification);
  }

  async findByRecipient(recipientId: string, limit: number = 20, skip: number = 0): Promise<INotification[]> {
    return await this._model.find({ recipient: recipientId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('sender', 'name avatar');
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this._model.updateMany({ recipient: recipientId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return await this._model.countDocuments({ recipient: recipientId, isRead: false });
  }
}
