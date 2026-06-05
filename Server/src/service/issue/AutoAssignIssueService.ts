import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
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
    @inject(TYPES.ITeamRepository) private _teamRepository: ITeamRepository,
    @inject(TYPES.IAIService) private _aiService: IAIService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(issueId: string, userId: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error(EMPLOYEE_MESSAGES.ASSIGNER_NOT_FOUND);

    const issue = await this._issueRepository.findById(issueId);
    if (!issue) throw new Error(ISSUE_MESSAGES.NOT_FOUND);

    const companyTeams = await this._teamRepository.find({ company_id: assigner.company_id.toString() });
    if (!companyTeams || companyTeams.length === 0) {
      throw new Error('No teams defined for the company to perform AI assignment.');
    }
    const teamNames = companyTeams.map((t) => t.name);

    const taskData = AIMapper.toTaskAIDataFromIssue(issue);

    const matchedTeamResult = await this._aiService.determineTeamForTask({ task: taskData, teams: teamNames });
    const matchedTeamName = matchedTeamResult.matchedTeamName;

    const matchedTeam = companyTeams.find((t) => t.name.toLowerCase() === matchedTeamName.toLowerCase());
    if (!matchedTeam) {
      throw new Error(`AI matched team "${matchedTeamName}" is not registered in the database.`);
    }

    const teamEmployees = await this._employeeRepository.findPopulated({
      company_id: assigner.company_id,
      team_id: matchedTeam._id,
    });

    if (teamEmployees.length === 0) {
      throw new Error(`No employees found in the matched team: ${matchedTeam.name}`);
    }

    const employeeWorkloads = await Promise.all(
      teamEmployees.map(async (emp) => {
        const assignedIssues = await this._issueRepository.findActiveByAssigneeId(emp._id.toString());
        const assignedSubTasks = await this._subTaskRepository.findActiveByAssigneeId(emp._id.toString());
        return {
          employee: emp,
          workload: assignedIssues.length + assignedSubTasks.length,
        };
      }),
    );

    employeeWorkloads.sort((a, b) => a.workload - b.workload);
    const chosenWorkload = employeeWorkloads[0];
    if (!chosenWorkload) {
      throw new Error(`Failed to determine the employee with the lowest workload.`);
    }
    const chosenEmployee = chosenWorkload.employee;
    const chosenAssigneeId = chosenEmployee._id.toString();

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
