import { IBaseRepository } from './IBaseRepository';
import { INotification } from '../../models/notification.model';

export interface INotificationRepository extends IBaseRepository<INotification> {
  findByRecipient(recipientId: string, limit?: number, skip?: number): Promise<INotification[]>;
  markAllAsRead(recipientId: string): Promise<void>;
  getUnreadCount(recipientId: string): Promise<number>;
}
