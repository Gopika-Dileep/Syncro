import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  ISSUE_ASSIGNED = 'issue_assigned',
  SUBTASK_ASSIGNED = 'subtask_assigned',
  SUBTASK_SUBMITTED = 'subtask_submitted',
  SUBTASK_APPROVED = 'subtask_approved',
  SUBTASK_REJECTED = 'subtask_rejected',
  ITEM_BLOCKED = 'item_blocked',
  MENTIONED = 'mentioned',
  NEW_COMMENT = 'new_comment',
  PROJECT_CREATED = 'project_created',
  PROJECT_COMPLETED = 'project_completed',
}

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedEntityId?: mongoose.Types.ObjectId;
  relatedEntityType?: 'Issue' | 'SubTask';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'Employee' },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    relatedEntityId: { type: Schema.Types.ObjectId },
    relatedEntityType: { type: String, enum: ['Issue', 'SubTask'] },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
