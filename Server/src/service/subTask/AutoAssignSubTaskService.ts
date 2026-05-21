import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IAIService } from '../../interfaces/services/ai/IAIService';
import { IAutoAssignSubTaskService } from '../../interfaces/services/subTask/IAutoAssignSubTaskService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AutoAssignSubTaskService implements IAutoAssignSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IAIService) private _aiService: IAIService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(subTaskId: string, userId: string): Promise<SubTaskResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const subTask = await this._subTaskRepository.findById(subTaskId);
    if (!subTask) throw new Error('Sub-task not found');

    // Get all employees in the same company (or you could filter by team)
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
      title: subTask.title,
      description: subTask.description,
      priority: subTask.priority,
      status: subTask.status
    };

    // Call the AI Service
    const aiDecision = await this._aiService.assignTask(taskData, employeeData);
    
    const chosenAssigneeId = aiDecision.assignedEmployeeId;
    const assignee = await this._employeeRepository.findById(chosenAssigneeId);
    if (assignee) await assignee.populate('user_id');

    let oldAssigneeIdStr: string | null = null;
    if (subTask.assignee_id) {
      const assigneeId = subTask.assignee_id as any;
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

    const updatedSubTask = await this._subTaskRepository.updateById(subTaskId, {
      assignee_id: chosenAssigneeId,
      assigned_by: assigner._id,
      $push: { history: historyEntry },
    } as any);

    if (!updatedSubTask) throw new Error('Sub-task not found after update');

    // Send Notification to Assignee
    if (chosenAssigneeId && String(chosenAssigneeId) !== String(subTask.assignee_id)) {
      await this._notificationService.createNotification({
        recipientId: chosenAssigneeId,
        senderId: assigner._id.toString(),
        type: NotificationType.SUBTASK_ASSIGNED,
        title: 'New Sub-task Assigned by AI',
        message: `You have been assigned to: ${updatedSubTask.title}`,
        link: `/employee/tasks?selectedTask=${updatedSubTask._id.toString()}`,
        relatedEntityId: updatedSubTask._id.toString(),
        relatedEntityType: 'SubTask',
      });
    }

    return SubTaskMapper.toResponseDTO(updatedSubTask);
  }
}
