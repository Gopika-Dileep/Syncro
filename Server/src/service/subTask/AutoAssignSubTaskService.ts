import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IAIService } from '../../interfaces/services/ai/IAIService';
import { ICreateHistoryInput } from '../../dto/issue.dto';
import { IAutoAssignSubTaskService } from '../../interfaces/services/subTask/IAutoAssignSubTaskService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { AIMapper } from '../../mappers/ai.mapper';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { NotificationType } from '../../enums/NotificationEnums';
import { EMPLOYEE_MESSAGES, SUBTASK_MESSAGES } from '../../constants/messages';
import mongoose from 'mongoose';

@injectable()
export class AutoAssignSubTaskService implements IAutoAssignSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IAIService) private _aiService: IAIService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) { }

  async execute(subTaskId: string, userId: string): Promise<SubTaskResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error(EMPLOYEE_MESSAGES.ASSIGNER_NOT_FOUND);

    const subTask = await this._subTaskRepository.findById(subTaskId);
    if (!subTask) throw new Error(SUBTASK_MESSAGES.NOT_FOUND);

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

    const taskData = AIMapper.toTaskAIDataFromSubTask(subTask);

    const aiDecision = await this._aiService.assignTask({ task: taskData, employees: employeeData });

    const chosenAssigneeId = aiDecision.assignedEmployeeId;
    const assignee = await this._employeeRepository.findPopulatedById(chosenAssigneeId);

    let oldAssigneeIdStr: string | null = null;
    if (subTask.assignee_id) {
      const assigneeId = subTask.assignee_id as { _id?: string | mongoose.Types.ObjectId } | string | mongoose.Types.ObjectId;
      oldAssigneeIdStr = (assigneeId as { _id?: string | mongoose.Types.ObjectId })._id ? (assigneeId as { _id?: string | mongoose.Types.ObjectId })._id!.toString() : assigneeId.toString();
    }

    const oldAssignee = oldAssigneeIdStr ? await this._employeeRepository.findPopulatedById(oldAssigneeIdStr) : null;

    const historyEntry: ICreateHistoryInput = {
      action: 'assignee_change',
      from: oldAssignee?.user_id?.name || 'Unassigned',
      to: assignee?.user_id?.name || 'Unknown',
      user: String(assigner._id),
    };

    const updatedSubTask = await this._subTaskRepository.updateWithHistory(
      subTaskId,
      {
        assignee_id: chosenAssigneeId,
        assigned_by: assigner._id,
      },
      historyEntry,
    );

    if (!updatedSubTask) throw new Error(SUBTASK_MESSAGES.NOT_FOUND_AFTER_UPDATE);

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
