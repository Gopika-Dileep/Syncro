import { injectable, inject } from 'inversify';
import { IAddCommentToSubTaskService } from '../../interfaces/services/subTask/IAddCommentToSubTaskService';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ISubTask } from '../../models/subTask.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { ISocketService } from '../../interfaces/services/ISocketService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AddCommentToSubTaskService implements IAddCommentToSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(subTaskId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<ISubTask> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const actorId = employee?._id ? String(employee._id) : userId;

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      $push: {
        comments: {
          user: actorId,
          text,
          attachments,
          created_at: new Date(),
        },
      },
    });

    if (!subTask) {
      throw new NotFoundError('Sub-task not found');
    }

    const updatedSubTask = (await this._subTaskRepository.findById(subTaskId, {
      populate: [
        { path: 'comments.user', populate: { path: 'user_id', select: 'name avatar' } },
        { path: 'attachments.uploaded_by', populate: { path: 'user_id', select: 'name avatar' } },
        { path: 'team_id', select: 'name' },
        { path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] },
        { path: 'created_by', populate: { path: 'user_id' } },
        { path: 'assigned_by', populate: { path: 'user_id' } },
      ],
    })) as ISubTask;

    // Real-time comment update
    this._socketService.emitToRoom(`subtask:${subTaskId}`, 'new_comment', {
      subTaskId,
      comment: updatedSubTask.comments[updatedSubTask.comments.length - 1],
    });

    // Handle Mentions
    const mentionRegex = /@\[([a-f\d]{24})\]\(([^)]+)\)/g;
    let match;
    const mentionedUserIds = new Set<string>();
    while ((match = mentionRegex.exec(text)) !== null) {
      if (match[1]) {
        mentionedUserIds.add(match[1]);
      }
    }

    for (const mentionedUserId of mentionedUserIds) {
      if (mentionedUserId !== actorId.toString()) {
        await this._notificationService.createNotification({
          recipientId: mentionedUserId,
          senderId: actorId.toString(),
          type: NotificationType.MENTIONED,
          title: 'You were mentioned',
          message: `${employee?.user_id?.name || 'Someone'} mentioned you in a sub-task comment`,
          link: `/employee/tasks?selectedTask=${subTaskId}`,
          relatedEntityId: subTaskId,
          relatedEntityType: 'SubTask',
        });
      }
    }

    return updatedSubTask;
  }
}
