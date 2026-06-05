import { INotification } from '../../../models/notification.model';
import { CreateNotificationDTO, GetNotificationsDTO } from '../../../dto/notification.dto';

export interface INotificationService {
  createNotification(params: CreateNotificationDTO): Promise<INotification>;
  getNotifications(query: GetNotificationsDTO): Promise<{ notifications: INotification[]; total: number; unreadCount: number }>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<void>;
}
