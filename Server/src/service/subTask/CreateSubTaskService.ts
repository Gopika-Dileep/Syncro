import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ICreateSubTaskService } from '../../interfaces/services/subTask/ICreateSubTaskService';
import { CreateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { NotificationType } from '../../models/notification.model';
import { BadRequestError } from '../../errors/AppError';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IssueType } from '../../enums/IssueEnums';

import { ISubTask } from '../../models/subTask.model';

@injectable()
export class CreateSubTaskService implements ICreateSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(data: CreateSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const creator = await this._employeeRepository.findByUserId(userId);
    if (!creator) throw new Error('Employee not found');

    const issue = await this._issueRepository.findById(data.issue_id);
    if (!issue) throw new BadRequestError('Issue not found');

    if (issue.type === IssueType.STORY) {
      const maxAllowedHours = (issue.story_points || 0) * 8;

      const existingSubTasks = await this._subTaskRepository.findAllByIssueId(data.issue_id);
      const totalEstimatedHours = existingSubTasks.reduce((sum, st) => sum + (st.estimated_hours || 0), 0);

      const newEstimatedHours = data.estimated_hours || 0;
      const remainingHours = maxAllowedHours - totalEstimatedHours;

      if (newEstimatedHours > remainingHours) {
        throw new BadRequestError(`You can't have a subtask of ${newEstimatedHours} hrs. Only ${remainingHours} hrs left in this story.`);
      }
    }

    const createdSubTask = await this._subTaskRepository.create({
      ...data,
      company_id: creator.company_id?._id || creator.company_id,
      team_id: creator.team_id?._id || creator.team_id,
      created_by: creator._id,
    } as unknown as ISubTask);

    if (data.assignee_id) {
      await this._notificationService.createNotification({
        recipientId: data.assignee_id,
        senderId: creator._id.toString(),
        type: NotificationType.SUBTASK_ASSIGNED,
        title: 'New Sub-task Assigned',
        message: `You have been assigned a new sub-task: ${createdSubTask.title}`,
        link: `/employee/tasks?selectedTask=${createdSubTask._id.toString()}`,
        relatedEntityId: createdSubTask._id.toString(),
        relatedEntityType: 'SubTask',
      });
    }

    return SubTaskMapper.toResponseDTO(createdSubTask);
  }
}
