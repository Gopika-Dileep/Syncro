import { injectable } from 'inversify';
import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';
import { Notification, INotification } from '../models/notification.model';

@injectable()
export class NotificationRepository implements INotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return await Notification.create(data);
  }

  async findByRecipient(recipientId: string, limit: number = 20, skip: number = 0): Promise<INotification[]> {
    return await Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar');
  }

  async findById(id: string): Promise<INotification | null> {
    return await Notification.findById(id);
  }

  async updateById(id: string, data: Partial<INotification>): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(id, data, { new: true });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await Notification.updateMany({ recipient: recipientId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return await Notification.countDocuments({ recipient: recipientId, isRead: false });
  }
}
