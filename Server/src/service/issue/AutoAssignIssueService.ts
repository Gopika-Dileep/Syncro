import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IAIService } from '../../interfaces/services/ai/IAIService';
import { IAutoAssignIssueService } from '../../interfaces/services/issue/IAutoAssignIssueService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AutoAssignIssueService implements IAutoAssignIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IAIService) private _aiService: IAIService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(issueId: string, userId: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const issue = await this._issueRepository.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    // Get all employees in the same company
    const employees = await this._employeeRepository.find({ company_id: assigner.company_id });

    // For each employee, count their active workload (issues + subtasks not yet Done)
    const employeeData = await Promise.all(employees.map(async (emp) => {
      const empId = emp._id.toString();

      // Count active issues assigned to this employee (status != Done)
      const assignedIssues = await this._issueRepository.find({
        assignee_id: emp._id,
        status: { $nin: ['Done'] },
      });

      // Count active subtasks assigned to this employee (status != Done)
      const assignedSubTasks = await this._subTaskRepository.find({
        assignee_id: emp._id,
        status: { $nin: ['Done'] },
      });

      return {
        id: empId,
        name: (emp as any).user_id?.name || 'Unknown',
        skills: emp.skills || [],
        designation: emp.designation || 'Employee',
        activeIssues: assignedIssues.length,
        activeSubTasks: assignedSubTasks.length,
        totalActiveWorkload: assignedIssues.length + assignedSubTasks.length,
      };
    }));

    const taskData = {
      title: issue.title,
      description: issue.description || '',
      priority: issue.priority,
      status: issue.status
    };

    // Call the AI Service
    const aiDecision = await this._aiService.assignTask(taskData, employeeData);
    
    const chosenAssigneeId = aiDecision.assignedEmployeeId;
    const assignee = await this._employeeRepository.findById(chosenAssigneeId);
    if (assignee) await assignee.populate('user_id');

    let oldAssigneeIdStr: string | null = null;
    if (issue.assignee_id) {
      const assigneeId = issue.assignee_id as any;
      oldAssigneeIdStr = assigneeId._id ? assigneeId._id.toString() : assigneeId.toString();
    }

    const oldAssignee = oldAssigneeIdStr ? await this._employeeRepository.findById(oldAssigneeIdStr) : null;
    if (oldAssignee) await oldAssignee.populate('user_id');

    const historyEntry = {
      action: 'assignee_change',
      from: (oldAssignee as any)?.user_id?.name || 'Unassigned',
      to: (assignee as any)?.user_id?.name || 'Unknown',
      user: assigner._id,
      created_at: new Date()
    };

    // Update Issue in DB
    const updatedIssue = await this._issueRepository.updateById(issueId, {
      assignee_id: chosenAssigneeId,
      assigned_by: assigner._id,
      $push: { history: historyEntry },
    } as any);

    if (!updatedIssue) throw new Error('Issue not found after update');

    // Send Notification to Assignee
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
