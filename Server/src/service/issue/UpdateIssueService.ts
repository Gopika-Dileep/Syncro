import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUpdateIssueService } from '../../interfaces/services/issue/IUpdateIssueService';
import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IssueStatus } from '../../enums/IssueEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class UpdateIssueService implements IUpdateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(issueId: string, data: UpdateIssueRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<IssueResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const oldIssue = await this._issueRepository.findById(issueId);
    if (!oldIssue) throw new Error('Issue not found');

    if (data.sprint_id && String(data.sprint_id) !== String(oldIssue.sprint_id)) {
      const isCompany = userRole === 'company';
      const type = (oldIssue.type || 'task').toLowerCase();
      const hasSprintPerm = permissions.includes(`issue:${type}:assign_to_sprint`);
      
      if (!isCompany && !hasSprintPerm) {
        throw new Error(`You do not have permission to add this ${type} to a sprint`);
      }

      if (!oldIssue.sprint_id && oldIssue.status !== 'Ready') {
        throw new Error(`Only items with status 'Ready' can be added to a sprint. Please mark this ${type} as ready first.`);
      }
    }

    const historyEntry = {
      user: employee?._id,
      created_at: new Date(),
      action: 'updated' as string,
      from: undefined as string | undefined,
      to: undefined as string | undefined,
    };

    if (data.status && data.status !== oldIssue.status) {
      if (data.status === IssueStatus.BLOCKED && !data.blocked_reason) {
        throw new Error('Blocked reason is required when blocking an issue');
      }
      historyEntry.action = 'status_change';
      historyEntry.from = oldIssue.status;
      historyEntry.to = data.status;

      // Notify Admin if Blocked
      if (data.status === IssueStatus.BLOCKED) {
          this.notifyAdminOfBlock(oldIssue.project_id.toString(), oldIssue.title, data.blocked_reason || 'No reason', employee?._id?.toString() || userId, employee?.user_id?.name || 'Someone', issueId, 'Issue');
      }
    }

    const issue = await this._issueRepository.updateById(issueId, {
      ...data,
      $push: { history: historyEntry },
    });
    if (!issue) throw new Error('Issue not found');

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
                  const adminEmployee = await this._employeeRepository.findOne({ user_id: company.user_id });
                  if (adminEmployee) {
                      await this._notificationService.createNotification({
                          recipientId: adminEmployee._id.toString(),
                          senderId: senderId,
                          type: NotificationType.ITEM_BLOCKED,
                          title: 'Critical Item Blocked',
                          message: `${senderName} blocked ${title} in project ${project.name}. Reason: ${reason}`,
                          link: `/employee/backlogs?selectedIssue=${entityId}`,
                          relatedEntityId: entityId,
                          relatedEntityType: entityType
                      });
                  }
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
          // Notify Admin of completion
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
                          link: `/employee/projects`
                      });
                  }
              }
          } catch (err) {
              console.error('Failed to notify admin of project completion', err);
          }
      }
    }
  };
}
