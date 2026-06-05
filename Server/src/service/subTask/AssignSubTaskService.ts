import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IAssignSubTaskService } from '../../interfaces/services/subTask/IAssignSubTaskService';
import { AssignSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../enums/NotificationEnums';
import { NotFoundError, ForbiddenError } from '../../errors/AppError';
import { EMPLOYEE_MESSAGES, SUBTASK_MESSAGES } from '../../constants/messages';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IssueType } from '../../enums/IssueEnums';

@injectable()
export class AssignSubTaskService implements IAssignSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(subTaskId: string, data: AssignSubTaskRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<SubTaskResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new NotFoundError(EMPLOYEE_MESSAGES.ASSIGNER_NOT_FOUND);

    const oldSubTask = await this._subTaskRepository.findById(subTaskId);
    if (!oldSubTask) throw new NotFoundError(SUBTASK_MESSAGES.NOT_FOUND);

    // Fetch parent issue to check permissions
    const issueIdObj = oldSubTask.issue_id as unknown as { _id?: { toString(): string } };
    const parentIssueId = issueIdObj?._id ? issueIdObj._id.toString() : oldSubTask.issue_id.toString();

    const parentIssue = await this._issueRepository.findById(parentIssueId);
    if (!parentIssue) throw new NotFoundError('Parent issue not found');

    if (parentIssue.type === IssueType.STORY) {
      const assigneeObj = parentIssue.assignee_id as unknown as { _id?: { toString(): string } };
      const assigneeId = assigneeObj?._id ? assigneeObj._id.toString() : parentIssue.assignee_id?.toString();

      const isAssignee = assigneeId && assigneeId === assigner._id.toString();
      const isCompanyAdmin = userRole === 'company';

      if (!isAssignee && !isCompanyAdmin) {
        throw new ForbiddenError('Only the assignee of the parent User Story can assign its subtasks');
      }
    } else {
      const hasTaskAssignPermission = permissions.includes('task:assign');
      const isCompanyAdmin = userRole === 'company';

      if (!hasTaskAssignPermission && !isCompanyAdmin) {
        throw new ForbiddenError('You do not have permission to assign subtasks under this issue type');
      }
    }

    const assignee = await this._employeeRepository.findPopulatedById(data.assignee_id);
    const oldAssigneeObj = oldSubTask.assignee_id as unknown as { _id?: { toString(): string } };
    const oldAssigneeIdStr = oldAssigneeObj?._id ? oldAssigneeObj._id.toString() : oldSubTask.assignee_id?.toString();
    const oldAssignee = oldAssigneeIdStr ? await this._employeeRepository.findPopulatedById(oldAssigneeIdStr) : null;

    const historyEntry: ICreateHistoryInput = {
      action: 'assignee_change',
      from: oldAssignee?.user_id?.name || 'Unassigned',
      to: assignee?.user_id?.name || 'Unknown',
      user: String(assigner._id),
    };

    const subTask = await this._subTaskRepository.updateWithHistory(
      subTaskId,
      {
        assignee_id: data.assignee_id,
        assigned_by: assigner._id,
      },
      historyEntry,
    );

    if (!subTask) throw new NotFoundError(SUBTASK_MESSAGES.NOT_FOUND);

    if (data.assignee_id && String(data.assignee_id) !== String(oldSubTask.assignee_id)) {
      await this._notificationService.createNotification({
        recipientId: data.assignee_id,
        senderId: assigner._id.toString(),
        type: NotificationType.SUBTASK_ASSIGNED,
        title: 'New Sub-task Assigned',
        message: `You have been assigned a new sub-task: ${subTask.title}`,
        link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
        relatedEntityId: subTask._id.toString(),
        relatedEntityType: 'SubTask',
      });
    }

    return SubTaskMapper.toResponseDTO(subTask);
  }
}
