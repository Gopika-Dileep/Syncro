import { INotification, NotificationType } from '../../models/notification.model';

export interface INotificationService {
  createNotification(params: { recipientId: string; senderId?: string; type: NotificationType; title: string; message: string; link?: string; relatedEntityId?: string; relatedEntityType?: 'Issue' | 'SubTask' }): Promise<INotification>;
  getNotifications(recipientId: string, page: number, limit: number): Promise<{ notifications: INotification[]; total: number; unreadCount: number }>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(recipientId: string): Promise<void>;
}
