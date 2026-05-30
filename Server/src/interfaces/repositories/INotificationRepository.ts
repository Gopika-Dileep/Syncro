import { INotification } from '../../models/notification.model';

export interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findByRecipient(recipientId: string, limit?: number, skip?: number): Promise<INotification[]>;
  findById(id: string): Promise<INotification | null>;
  updateById(id: string, data: Partial<INotification>): Promise<INotification | null>;
  markAllAsRead(recipientId: string): Promise<void>;
  getUnreadCount(recipientId: string): Promise<number>;
}
