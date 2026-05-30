import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository, ICreateHistoryInput } from '../../interfaces/repositories/IIssueRepository';
import { ISubmitSubTaskService } from '../../interfaces/services/subTask/ISubmitSubTaskService';
import { SubmitSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { NotificationType } from '../../models/notification.model';

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
        await this._notificationService.createNotification({
          recipientId: subTask.assigned_by.toString(),
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

    throw new Error('Task not found');
  }
}
