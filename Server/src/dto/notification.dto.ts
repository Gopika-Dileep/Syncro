import { NotificationType } from '../models/notification.model';

export interface CreateNotificationDTO {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'Issue' | 'SubTask';
}

export interface GetNotificationsDTO {
  userId: string;
  page: number;
  limit: number;
}
