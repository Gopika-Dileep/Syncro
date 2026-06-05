import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { ISubmitSubTaskService } from '../../interfaces/services/subTask/ISubmitSubTaskService';
import { SubmitSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../enums/NotificationEnums';
import { NotFoundError, ForbiddenError } from '../../errors/AppError';
import { TASK_MESSAGES } from '../../constants/messages';

@injectable()
export class SubmitSubTaskService implements ISubmitSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(subTaskId: string, data: SubmitSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const actorId = employee?._id ? String(employee._id) : userId;

    const existingSubTask = await this._subTaskRepository.findById(subTaskId);
    if (existingSubTask) {
      const assigneeObj = existingSubTask.assignee_id as unknown as { _id?: { toString(): string } };
      const assigneeId = assigneeObj?._id ? assigneeObj._id.toString() : existingSubTask.assignee_id?.toString();

      if (assigneeId !== actorId) {
        throw new ForbiddenError('You can only submit work for subtasks assigned to you');
      }
    } else {
      const existingIssue = await this._issueRepository.findById(subTaskId);
      if (existingIssue) {
        const assigneeObj = existingIssue.assignee_id as unknown as { _id?: { toString(): string } };
        const assigneeId = assigneeObj?._id ? assigneeObj._id.toString() : existingIssue.assignee_id?.toString();

        if (assigneeId !== actorId) {
          throw new ForbiddenError('You can only submit work for issues assigned to you');
        }
      }
    }

    const historyEntry: ICreateHistoryInput = {
      action: 'status_change',
      from: SubTaskStatus.IN_PROGRESS,
      to: SubTaskStatus.IN_REVIEW,
      user: actorId,
    };

    const subTask = await this._subTaskRepository.updateWithHistory(
      subTaskId,
      {
        ...data,
        status: SubTaskStatus.IN_REVIEW,
        rework_reason: undefined,
      },
      historyEntry,
    );

    if (subTask) {
      if (subTask.assigned_by) {
        const assignedByObj = subTask.assigned_by as unknown as { _id?: { toString(): string } };
        const recipientId = assignedByObj?._id ? assignedByObj._id.toString() : subTask.assigned_by.toString();

        await this._notificationService.createNotification({
          recipientId,
          senderId: employee?._id.toString() || userId,
          type: NotificationType.SUBTASK_SUBMITTED,
          title: 'Sub-task Ready for Review',
          message: `${employee?.user_id?.name || 'An employee'} submitted a sub-task for review: ${subTask.title}`,
          link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
          relatedEntityId: subTask._id.toString(),
          relatedEntityType: 'SubTask',
        });
      }
      return SubTaskMapper.toResponseDTO(subTask);
    }

    const issue = await this._issueRepository.updateById(subTaskId, {
      ...data,
      status: 'In Review',
    });

    if (issue) {
      return SubTaskMapper.fromIssue(issue);
    }

    throw new NotFoundError(TASK_MESSAGES.NOT_FOUND);
  }
}
