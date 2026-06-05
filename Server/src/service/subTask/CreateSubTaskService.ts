import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ICreateSubTaskService } from '../../interfaces/services/subTask/ICreateSubTaskService';
import { CreateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../enums/NotificationEnums';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../errors/AppError';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IssueType } from '../../enums/IssueEnums';
import { EMPLOYEE_MESSAGES, ISSUE_MESSAGES } from '../../constants/messages';

import { ISubTask } from '../../models/subTask.model';

@injectable()
export class CreateSubTaskService implements ICreateSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(data: CreateSubTaskRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<SubTaskResponseDTO> {
    const creator = await this._employeeRepository.findByUserId(userId);
    if (!creator) throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);

    const issue = await this._issueRepository.findById(data.issue_id);
    if (!issue) throw new BadRequestError(ISSUE_MESSAGES.NOT_FOUND);

    // Permission checks
    if (issue.type === IssueType.STORY) {
      const assigneeObj = issue.assignee_id as unknown as { _id?: { toString(): string } };
      const assigneeId = assigneeObj?._id ? assigneeObj._id.toString() : issue.assignee_id?.toString();

      const isAssignee = assigneeId && assigneeId === creator._id.toString();
      const isCompanyAdmin = userRole === 'company';

      console.log('--- CREATE SUBTASK DEBUG LOGS ---');
      console.log('issue.type:', issue.type);
      console.log('issue.assignee_id:', issue.assignee_id);
      console.log('assigneeId:', assigneeId);
      console.log('creator._id:', creator._id);
      console.log('creator._id.toString():', creator._id.toString());
      console.log('isAssignee:', isAssignee);
      console.log('userRole:', userRole);
      console.log('isCompanyAdmin:', isCompanyAdmin);
      console.log('---------------------------------');

      if (!isAssignee && !isCompanyAdmin) {
        throw new ForbiddenError('Only the assignee of the parent User Story can create subtasks under it');
      }
    } else {
      const hasTaskCreatePermission = permissions.includes('task:create');
      const isCompanyAdmin = userRole === 'company';

      if (!hasTaskCreatePermission && !isCompanyAdmin) {
        throw new ForbiddenError('You do not have permission to create subtasks under this issue type');
      }
    }

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
