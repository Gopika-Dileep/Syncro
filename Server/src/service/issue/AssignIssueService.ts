import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IssueStatus } from '../../enums/IssueEnums';
import { IIssueRepository, ICreateHistoryInput } from '../../interfaces/repositories/IIssueRepository';
import { IAssignIssueService } from '../../interfaces/services/issue/IAssignIssueService';
import { AssignIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AssignIssueService implements IAssignIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(data: AssignIssueRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const issueToUpdate = await this._issueRepository.findById(data.issue_id);
    if (!issueToUpdate) throw new Error('Issue not found');

    const isCompany = userRole === 'company';
    const type = (issueToUpdate.type || 'task').toLowerCase();

    if (data.assignee_id && String(data.assignee_id) !== String(issueToUpdate.assignee_id)) {
      if (!isCompany && !permissions.includes(`issue:${type}:assign`)) {
        throw new Error(`You do not have permission to assign this ${type}`);
      }
    }

    if (data.sprint_id && String(data.sprint_id) !== String(issueToUpdate.sprint_id)) {
      if (!isCompany && !permissions.includes(`issue:${type}:assign_to_sprint`)) {
        throw new Error(`You do not have permission to add this ${type} to a sprint`);
      }

      if (!issueToUpdate.sprint_id && issueToUpdate.status !== 'Ready') {
        throw new Error(`Only items with status 'Ready' can be added to a sprint. Please mark this ${type} as ready first.`);
      }
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

    if (!updatedIssue) throw new Error('Failed to update issue');

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
}
