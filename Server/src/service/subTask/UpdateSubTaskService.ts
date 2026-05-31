import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IUpdateSubTaskService } from '../../interfaces/services/subTask/IUpdateSubTaskService';
import { UpdateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { NotificationType } from '../../enums/NotificationEnums';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IssueType } from '../../enums/IssueEnums';
import { BadRequestError } from '../../errors/AppError';

@injectable()
export class UpdateSubTaskService implements IUpdateSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) { }

  async execute(subTaskId: string, data: UpdateSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const oldSubTask = await this._subTaskRepository.findById(subTaskId);
    if (!oldSubTask) throw new Error('Sub-task not found');

    if (data.estimated_hours !== undefined && data.estimated_hours !== oldSubTask.estimated_hours) {
      const issue = await this._issueRepository.findById(oldSubTask.issue_id.toString());
      if (issue && issue.type === IssueType.STORY) {
        const maxAllowedHours = (issue.story_points || 0) * 8;

        const existingSubTasks = await this._subTaskRepository.findAllByIssueId(oldSubTask.issue_id.toString());
        const otherSubTasks = existingSubTasks.filter((st) => st._id.toString() !== subTaskId);
        const totalOtherEstimatedHours = otherSubTasks.reduce((sum, st) => sum + (st.estimated_hours || 0), 0);

        const remainingHours = maxAllowedHours - totalOtherEstimatedHours;

        if (data.estimated_hours > remainingHours) {
          throw new BadRequestError(`You can't have a subtask of ${data.estimated_hours} hrs. Only ${remainingHours} hrs left in this story.`);
        }
      }
    }

    const actorId = employee?._id ? String(employee._id) : userId;
    const historyEntry: ICreateHistoryInput = {
      user: actorId,
      action: 'updated',
      from: undefined,
      to: undefined,
    };

    if (data.status && data.status !== oldSubTask.status) {
      if (data.status === 'Blocked' && !data.blocked_reason) {
        throw new Error('Blocked reason is required when blocking a task');
      }
      historyEntry.action = 'status_change';
      historyEntry.from = oldSubTask.status;
      historyEntry.to = data.status;
    }

    const subTask = await this._subTaskRepository.updateWithHistory(subTaskId, data, historyEntry);
    if (!subTask) throw new Error('Sub-task not found');

    if (data.status === 'Blocked') {
      if (subTask.assigned_by) {
        await this._notificationService.createNotification({
          recipientId: (subTask.assigned_by as unknown as { _id?: { toString(): string } })?._id?.toString() || subTask.assigned_by.toString(),
          senderId: employee?._id.toString() || userId,
          type: NotificationType.ITEM_BLOCKED,
          title: 'Task Blocked',
          message: `${employee?.user_id?.name || 'Someone'} blocked the task: ${subTask.title}. Reason: ${data.blocked_reason || 'No reason provided'}`,
          link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
          relatedEntityId: subTask._id.toString(),
          relatedEntityType: 'SubTask',
        });
      }

      try {
        const companyId = employee?.company_id?._id?.toString() || employee?.company_id?.toString();
        if (companyId) {
          const company = await this._companyRepo.findById(companyId);
          if (company) {
            const adminEmployee = await this._employeeRepository.findOne({ user_id: company.user_id });
            if (adminEmployee) {
              await this._notificationService.createNotification({
                recipientId: adminEmployee._id.toString(),
                senderId: employee?._id.toString() || userId,
                type: NotificationType.ITEM_BLOCKED,
                title: 'Critical Sub-Task Blocked',
                message: `${employee?.user_id?.name || 'Someone'} blocked sub-task "${subTask.title}". Reason: ${data.blocked_reason || 'No reason'}`,
                link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
                relatedEntityId: subTask._id.toString(),
                relatedEntityType: 'SubTask',
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to notify admin of blocked sub-task', err);
      }
    }

    if (data.blocked_reason) {
      const mentionRegex = /@\[([a-f\d]{24})\]\(([^)]+)\)/g;
      let match;
      const mentionedUserIds = new Set<string>();
      while ((match = mentionRegex.exec(data.blocked_reason)) !== null) {
        if (match[1]) {
          mentionedUserIds.add(match[1]);
        }
      }

      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== (employee?._id?.toString() || '')) {
          await this._notificationService.createNotification({
            recipientId: mentionedUserId,
            senderId: employee?._id.toString() || userId,
            type: NotificationType.MENTIONED,
            title: 'You were mentioned',
            message: `${employee?.user_id?.name || 'Someone'} mentioned you in a block reason for: ${subTask.title}`,
            link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
            relatedEntityId: subTask._id.toString(),
            relatedEntityType: 'SubTask',
          });
        }
      }
    }

    return SubTaskMapper.toResponseDTO(subTask);
  }
}
