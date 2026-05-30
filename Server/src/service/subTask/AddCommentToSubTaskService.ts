import { injectable, inject } from 'inversify';
import { IAddCommentToSubTaskService } from '../../interfaces/services/subTask/IAddCommentToSubTaskService';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ISubTask } from '../../models/subTask.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { ISocketService } from '../../interfaces/services/socket/ISocketService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AddCommentToSubTaskService implements IAddCommentToSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) { }

  async execute(subTaskId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<ISubTask> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const actorId = employee?._id ? String(employee._id) : userId;

    const updatedSubTask = await this._subTaskRepository.addComment(subTaskId, {
      user: actorId,
      text,
      attachments,
    });

    if (!updatedSubTask) {
      throw new NotFoundError('Sub-task not found');
    }

    this._socketService.emitToRoom(`subtask:${subTaskId}`, 'new_comment', {
      subTaskId,
      comment: updatedSubTask.comments[updatedSubTask.comments.length - 1],
    });

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
