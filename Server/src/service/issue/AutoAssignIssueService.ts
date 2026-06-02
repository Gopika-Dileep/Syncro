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
import { AIMapper } from '../../mappers/ai.mapper';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../enums/NotificationEnums';
import { EMPLOYEE_MESSAGES, ISSUE_MESSAGES } from '../../constants/messages';
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
    if (!assigner) throw new Error(EMPLOYEE_MESSAGES.ASSIGNER_NOT_FOUND);

    const issue = await this._issueRepository.findById(issueId);
    if (!issue) throw new Error(ISSUE_MESSAGES.NOT_FOUND);

    const employees = await this._employeeRepository.findPopulated({ company_id: assigner.company_id });

    const employeeData = await Promise.all(
      employees.map(async (emp) => {
        const assignedIssues = await this._issueRepository.findActiveByAssigneeId(emp._id.toString());

        const assignedSubTasks = await this._subTaskRepository.findActiveByAssigneeId(emp._id.toString());

        return AIMapper.toEmployeeAIData(
          emp,
          assignedIssues.length,
          assignedSubTasks.length
        );
      }),
    );

    const taskData = AIMapper.toTaskAIDataFromIssue(issue);

    const aiDecision = await this._aiService.assignTask({ task: taskData, employees: employeeData });

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

    if (!updatedIssue) throw new Error(ISSUE_MESSAGES.NOT_FOUND_AFTER_UPDATE);

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
