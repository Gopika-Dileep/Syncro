import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUpdateIssueService } from '../../interfaces/services/issue/IUpdateIssueService';
import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IssueStatus } from '../../enums/IssueEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { NotificationType } from '../../enums/NotificationEnums';
import { ISSUE_MESSAGES } from '../../constants/messages';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';

@injectable()
export class UpdateIssueService implements IUpdateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(issueId: string, data: UpdateIssueRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<IssueResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const oldIssue = await this._issueRepository.findById(issueId);
    if (!oldIssue) throw new NotFoundError(ISSUE_MESSAGES.NOT_FOUND);

    if (data.sprint_id && String(data.sprint_id) !== String(oldIssue.sprint_id)) {
      const isCompany = userRole === 'company';
      const type = (oldIssue.type || 'task').toLowerCase();
      const hasSprintPerm = permissions.includes(`issue:${type}:assign_to_sprint`);

      if (!isCompany && !hasSprintPerm) {
        throw new ForbiddenError(ISSUE_MESSAGES.NO_SPRINT_PERMISSION(type));
      }

      if (!oldIssue.sprint_id && oldIssue.status !== 'Ready') {
        throw new BadRequestError(ISSUE_MESSAGES.SPRINT_ADD_READY_ONLY(type));
      }
    }

    const targetSprintId = data.sprint_id !== undefined ? data.sprint_id : oldIssue.sprint_id;
    const newPoints = data.story_points !== undefined ? data.story_points : oldIssue.story_points;

    if (targetSprintId) {
      const sprintChanged = data.sprint_id !== undefined && String(data.sprint_id) !== String(oldIssue.sprint_id);
      const pointsChanged = data.story_points !== undefined && data.story_points !== oldIssue.story_points;

      if (sprintChanged || (oldIssue.sprint_id && pointsChanged)) {
        await this.validateSprintPointsLimit(String(targetSprintId), newPoints || 0, issueId);
      }
    }

    const historyEntry: ICreateHistoryInput = {
      user: employee?._id ? String(employee._id) : userId,
      action: 'updated',
      from: undefined,
      to: undefined,
    };

    if (data.status && data.status !== oldIssue.status) {
      if (data.status === IssueStatus.BLOCKED && !data.blocked_reason) {
        throw new BadRequestError(ISSUE_MESSAGES.BLOCKED_REASON_REQUIRED);
      }
      historyEntry.action = 'status_change';
      historyEntry.from = oldIssue.status;
      historyEntry.to = data.status;

      if (data.status === IssueStatus.BLOCKED) {
        this.notifyAdminOfBlock(oldIssue.project_id.toString(), oldIssue.title, data.blocked_reason || 'No reason', employee?._id?.toString() || userId, employee?.user_id?.name || 'Someone', issueId, 'Issue');
      }
    }

    const issue = await this._issueRepository.updateWithHistory(issueId, data, historyEntry);
    if (!issue) throw new NotFoundError(ISSUE_MESSAGES.NOT_FOUND);

    if (data.status === IssueStatus.DONE) {
      await this.checkAndCompleteProject(issue.project_id.toString(), employee?._id?.toString() || userId);
    }

    return IssueMapper.toResponseDTO(issue);
  }

  private async notifyAdminOfBlock(projectId: string, title: string, reason: string, senderId: string, senderName: string, entityId: string, entityType: 'Issue' | 'SubTask') {
    try {
      const project = await this._projectRepository.findById(projectId);
      if (project) {
        const company = await this._companyRepo.findById(project.company_id.toString());
        if (company) {
          await this._notificationService.createNotification({
            recipientId: company.user_id.toString(),
            senderId: senderId,
            type: NotificationType.ITEM_BLOCKED,
            title: 'Critical Item Blocked',
            message: `${senderName} blocked ${title} in project ${project.name}. Reason: ${reason}`,
            link: `/company/projects/${projectId}`,
            relatedEntityId: entityId,
            relatedEntityType: entityType,
          });
        }
      }
    } catch (err) {
      console.error('Failed to notify admin of block', err);
    }
  }

  private checkAndCompleteProject = async (projectId: string, senderId: string) => {
    const allIssues = await this._issueRepository.findAllByProjectId(projectId);
    if (allIssues.length > 0 && allIssues.every((i) => i.status === IssueStatus.DONE)) {
      const project = await this._projectRepository.updateById(projectId, { status: ProjectStatus.COMPLETED });
      if (project) {
        try {
          const company = await this._companyRepo.findById(project.company_id.toString());
          if (company) {
            const adminEmployee = await this._employeeRepository.findOne({ user_id: company.user_id });
            if (adminEmployee) {
              await this._notificationService.createNotification({
                recipientId: adminEmployee._id.toString(),
                senderId: senderId,
                type: NotificationType.PROJECT_COMPLETED,
                title: 'Project Completed',
                message: `All items are done! Project "${project.name}" is now marked as completed.`,
                link: `/employee/projects`,
              });
            }
          }
        } catch (err) {
          console.error('Failed to notify admin of project completion', err);
        }
      }
    }
  };

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
