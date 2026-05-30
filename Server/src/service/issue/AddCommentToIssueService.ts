import { injectable, inject } from 'inversify';
import { IAddCommentToIssueService } from '../../interfaces/services/issue/IAddCommentToIssueService';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IIssue } from '../../models/issue.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

import { INotificationService } from '../../interfaces/services/INotificationService';
import { ISocketService } from '../../interfaces/services/ISocketService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AddCommentToIssueService implements IAddCommentToIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(issueId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<IIssue> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const actorId = employee?._id ? String(employee._id) : userId;

    const updatedIssue = await this._issueRepository.addComment(issueId, {
      user: actorId,
      text,
      attachments,
    });

    if (!updatedIssue) {
      throw new NotFoundError('Issue not found');
    }

    this._socketService.emitToRoom(`issue:${issueId}`, 'new_comment', {
      issueId,
      comment: updatedIssue.comments[updatedIssue.comments.length - 1],
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
      if (mentionedUserId !== actorId) {
        await this._notificationService.createNotification({
          recipientId: mentionedUserId,
          senderId: actorId,
          type: NotificationType.MENTIONED,
          title: 'You were mentioned',
          message: `${employee?.user_id?.name || 'Someone'} mentioned you in a comment`,
          link: `/employee/backlogs?selectedIssue=${updatedIssue._id.toString()}`,
          relatedEntityId: issueId,
          relatedEntityType: 'Issue',
        });
      }
    }

    return updatedIssue;
  }
}
