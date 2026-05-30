import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IAIService } from '../../interfaces/services/ai/IAIService';
import { IAutoAssignIssueService } from '../../interfaces/services/issue/IAutoAssignIssueService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../models/notification.model';
import mongoose from 'mongoose';

@injectable()
export class AutoAssignIssueService implements IAutoAssignIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IAIService) private _aiService: IAIService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) { }

  async execute(issueId: string, userId: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const issue = await this._issueRepository.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    const employees = await this._employeeRepository.findPopulated({ company_id: assigner.company_id });

    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        const empId = emp._id.toString();

        const assignedIssues = await this._issueRepository.find({
          assignee_id: emp._id,
          status: { $nin: ['Done'] },
        });

        const assignedSubTasks = await this._subTaskRepository.find({
          assignee_id: emp._id,
          status: { $nin: ['Done'] },
        });

        return {
          id: empId,
          name: emp.user_id?.name || 'Unknown',
          skills: emp.skills || [],
          designation: emp.designation || 'Employee',
          team: (emp.team_id as any)?.name || 'Unassigned',
          activeIssues: assignedIssues.length,
          activeSubTasks: assignedSubTasks.length,
          totalActiveWorkload: assignedIssues.length + assignedSubTasks.length,
        };
      }),
    );

    const taskData = {
      title: issue.title,
      description: issue.description || '',
      priority: issue.priority,
      status: issue.status,
    };

    const aiDecision = await this._aiService.assignTask(taskData, employeeData);

    const chosenAssigneeId = aiDecision.assignedEmployeeId;
    const assignee = await this._employeeRepository.findPopulatedById(chosenAssigneeId);

    let oldAssigneeIdStr: string | null = null;
    if (issue.assignee_id) {
      const assigneeId = issue.assignee_id as { _id?: string | mongoose.Types.ObjectId } | string | mongoose.Types.ObjectId;
      oldAssigneeIdStr = (assigneeId as { _id?: string | mongoose.Types.ObjectId })._id ? (assigneeId as { _id?: string | mongoose.Types.ObjectId })._id!.toString() : assigneeId.toString();
    }

    const oldAssignee = oldAssigneeIdStr ? await this._employeeRepository.findPopulatedById(oldAssigneeIdStr) : null;

    const historyEntry: ICreateHistoryInput = {
      action: 'assignee_change',
      from: oldAssignee?.user_id?.name || 'Unassigned',
      to: assignee?.user_id?.name || 'Unknown',
      user: String(assigner._id),
    };

    const updatedIssue = await this._issueRepository.updateWithHistory(
      issueId,
      {
        assignee_id: chosenAssigneeId,
        assigned_by: assigner._id,
      },
      historyEntry,
    );

    if (!updatedIssue) throw new Error('Issue not found after update');

    if (chosenAssigneeId && String(chosenAssigneeId) !== String(issue.assignee_id)) {
      await this._notificationService.createNotification({
        recipientId: chosenAssigneeId,
        senderId: assigner._id.toString(),
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'New Issue Assigned by AI',
        message: `You have been assigned to: ${updatedIssue.title}`,
        link: `/employee/tasks?selectedIssue=${updatedIssue._id.toString()}`,
        relatedEntityId: updatedIssue._id.toString(),
        relatedEntityType: 'Issue',
      });
    }

    return IssueMapper.toResponseDTO(updatedIssue);
  }
}
