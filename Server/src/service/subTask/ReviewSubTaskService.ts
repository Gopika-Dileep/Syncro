import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository, ICreateHistoryInput } from '../../interfaces/repositories/IIssueRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IReviewSubTaskService } from '../../interfaces/services/subTask/IReviewSubTaskService';
import { ReviewSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IssueStatus } from '../../enums/IssueEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../models/notification.model';

interface IPopulatedId {
  _id: { toString(): string };
}

@injectable()
export class ReviewSubTaskService implements IReviewSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) { }

  async execute(subTaskId: string, data: ReviewSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);

    const actorId = employee?._id ? String(employee._id) : userId;

    const status = data.action === 'approve' ? SubTaskStatus.DONE : SubTaskStatus.IN_PROGRESS;

    const historyEntry: ICreateHistoryInput = {
      action: 'status_change',
      from: SubTaskStatus.IN_REVIEW,
      to: status,
      user: actorId,
    };

    const subTask = await this._subTaskRepository.updateWithHistory(
      subTaskId,
      {
        status,
        rework_reason: status === SubTaskStatus.DONE ? undefined : data.rework_reason,
      },
      historyEntry,
    );

    if (subTask) {
      if (status === SubTaskStatus.DONE) {
        try {
          const issueId = typeof subTask.issue_id === 'object' ? (subTask.issue_id as unknown as IPopulatedId)._id?.toString() : String(subTask.issue_id);
          if (issueId && issueId !== '[object Object]') {
            const allSubTasks = await this._subTaskRepository.findAllByIssueId(issueId);
            if (allSubTasks.length > 0 && allSubTasks.every((st) => st.status === SubTaskStatus.DONE)) {
              const updatedIssue = await this._issueRepository.updateById(issueId, { status: IssueStatus.DONE });
              if (updatedIssue) {
                await this.checkAndCompleteProject(String(updatedIssue.project_id));
              }
            }
          }
        } catch (error) {
          console.error('Auto-completion error (SubTask):', error);
        }
      }
      if (subTask.assignee_id) {
        await this._notificationService.createNotification({
          recipientId: subTask.assignee_id.toString(),
          senderId: actorId.toString(),
          type: status === SubTaskStatus.DONE ? NotificationType.SUBTASK_APPROVED : NotificationType.SUBTASK_REJECTED,
          title: status === SubTaskStatus.DONE ? 'Sub-task Approved' : 'Rework Requested',
          message: status === SubTaskStatus.DONE ? `Your sub-task "${subTask.title}" has been approved.` : `Rework requested for "${subTask.title}". Reason: ${data.rework_reason || 'See details'}`,
          link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
          relatedEntityId: subTask._id.toString(),
          relatedEntityType: 'SubTask',
        });
      }
      return SubTaskMapper.toResponseDTO(subTask);
    }

    const issue = await this._issueRepository.updateWithHistory(
      subTaskId,
      {
        status: status === SubTaskStatus.DONE ? IssueStatus.DONE : IssueStatus.IN_PROGRESS,
        rework_reason: status === SubTaskStatus.DONE ? undefined : data.rework_reason,
      },
      historyEntry,
    );

    if (issue) {
      if (status === SubTaskStatus.DONE) {
        try {
          const projectId = typeof issue.project_id === 'object' ? (issue.project_id as unknown as IPopulatedId)._id?.toString() : String(issue.project_id);
          if (projectId && projectId !== '[object Object]') {
            await this.checkAndCompleteProject(projectId);
          }
        } catch (error) {
          console.error('Auto-completion error (Issue):', error);
        }
      }
      if (issue.assignee_id) {
        await this._notificationService.createNotification({
          recipientId: issue.assignee_id.toString(),
          senderId: actorId.toString(),
          type: status === SubTaskStatus.DONE ? NotificationType.SUBTASK_APPROVED : NotificationType.SUBTASK_REJECTED,
          title: status === SubTaskStatus.DONE ? 'Task Approved' : 'Rework Requested',
          message: status === SubTaskStatus.DONE ? `Your task "${issue.title}" has been approved.` : `Rework requested for "${issue.title}". Reason: ${data.rework_reason || 'See details'}`,
          link: `/employee/backlogs?selectedIssue=${issue._id.toString()}`,
          relatedEntityId: issue._id.toString(),
          relatedEntityType: 'Issue',
        });
      }
      return SubTaskMapper.fromIssue(issue);
    }

    throw new Error('Task not found');
  }

  private async checkAndCompleteProject(projectId: string) {
    const allIssues = await this._issueRepository.findAllByProjectId(projectId);
    if (allIssues.length > 0 && allIssues.every((i) => i.status === IssueStatus.DONE)) {
      await this._projectRepository.updateById(projectId, { status: ProjectStatus.COMPLETED });
    }
  }
}
