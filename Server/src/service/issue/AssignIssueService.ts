import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IssueStatus } from '../../enums/IssueEnums';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IAssignIssueService } from '../../interfaces/services/issue/IAssignIssueService';
import { AssignIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../enums/NotificationEnums';
import { EMPLOYEE_MESSAGES, ISSUE_MESSAGES } from '../../constants/messages';
import { BadRequestError } from '../../errors/AppError';

@injectable()
export class AssignIssueService implements IAssignIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(data: AssignIssueRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error(EMPLOYEE_MESSAGES.ASSIGNER_NOT_FOUND);

    const issueToUpdate = await this._issueRepository.findById(data.issue_id);
    if (!issueToUpdate) throw new Error(ISSUE_MESSAGES.NOT_FOUND);

    const isCompany = userRole === 'company';
    const type = (issueToUpdate.type || 'task').toLowerCase();

    if (data.assignee_id && String(data.assignee_id) !== String(issueToUpdate.assignee_id)) {
      if (!isCompany && !permissions.includes(`issue:${type}:assign`)) {
        throw new Error(ISSUE_MESSAGES.NO_ASSIGN_PERMISSION(type));
      }
    }

    if (data.sprint_id && String(data.sprint_id) !== String(issueToUpdate.sprint_id)) {
      if (!isCompany && !permissions.includes(`issue:${type}:assign_to_sprint`)) {
        throw new Error(ISSUE_MESSAGES.NO_SPRINT_PERMISSION(type));
      }

      if (!issueToUpdate.sprint_id && issueToUpdate.status !== 'Ready') {
        throw new Error(ISSUE_MESSAGES.SPRINT_ADD_READY_ONLY(type));
      }

      const issuePoints = issueToUpdate.story_points || 0;
      await this.validateSprintPointsLimit(String(data.sprint_id), issuePoints, data.issue_id);
    }
   
    const updateData: Record<string, unknown> = {
      assigned_by: assigner._id,
    };

    if (data.sprint_id) {
      updateData.sprint_id = data.sprint_id;
      updateData.status = IssueStatus.TODO;
    }

    if (data.assignee_id) {
      updateData.assignee_id = data.assignee_id;
    }

    const historyEntries: ICreateHistoryInput[] = [];

    if (data.assignee_id && String(data.assignee_id) !== String(issueToUpdate.assignee_id)) {
      const assignee = await this._employeeRepository.findPopulatedById(data.assignee_id);
      const oldAssignee = issueToUpdate.assignee_id ? await this._employeeRepository.findPopulatedById(String(issueToUpdate.assignee_id)) : null;

      historyEntries.push({
        action: 'assignee_change',
        from: oldAssignee?.user_id?.name || 'Unassigned',
        to: assignee?.user_id?.name || 'Unknown',
        user: String(assigner._id),
      });
    }

    if (data.sprint_id && String(data.sprint_id) !== String(issueToUpdate.sprint_id)) {
      historyEntries.push({
        action: 'sprint_change',
        from: issueToUpdate.sprint_id ? 'Previous Sprint' : 'Backlog',
        to: 'New Sprint',
        user: String(assigner._id),
      });
    }

    const updatedIssue = await this._issueRepository.updateWithHistory(data.issue_id, updateData, historyEntries);

    if (!updatedIssue) throw new Error(ISSUE_MESSAGES.UPDATE_FAILED);

    if (data.assignee_id && String(data.assignee_id) !== String(issueToUpdate.assignee_id)) {
      await this._notificationService.createNotification({
        recipientId: data.assignee_id,
        senderId: assigner._id.toString(),
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'New Issue Assigned',
        message: `You have been assigned a new ${type}: ${updatedIssue.title}`,
        link: `/employee/backlogs?selectedIssue=${updatedIssue._id.toString()}`,
        relatedEntityId: updatedIssue._id.toString(),
        relatedEntityType: 'Issue',
      });
    }

    return IssueMapper.toResponseDTO(updatedIssue);
  }

  private async validateSprintPointsLimit(sprintId: string, issuePoints: number, excludeIssueId?: string): Promise<void> {
    const sprint = await this._sprintRepository.findById(sprintId);
    if (!sprint) return;

    const filter: Record<string, unknown> = { sprint_id: sprintId };
    if (excludeIssueId) {
      filter._id = { $ne: excludeIssueId };
    }
    const sprintIssues = await this._issueRepository.find(filter);
    const currentPoints = sprintIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);

    if (currentPoints + issuePoints > sprint.total_points) {
      throw new BadRequestError(`Cannot assign user story. Adding this issue of ${issuePoints} story points would exceed the sprint's remaining points limit. Sprint Limit: ${sprint.total_points} points, Currently assigned: ${currentPoints} points.`);
    }
  }
}
