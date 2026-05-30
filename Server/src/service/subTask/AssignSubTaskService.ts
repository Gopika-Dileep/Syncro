import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IAssignSubTaskService } from '../../interfaces/services/subTask/IAssignSubTaskService';
import { AssignSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { INotificationService } from '../../interfaces/services/INotificationService';
import { NotificationType } from '../../models/notification.model';

@injectable()
export class AssignSubTaskService implements IAssignSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(subTaskId: string, data: AssignSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const oldSubTask = await this._subTaskRepository.findById(subTaskId);
    if (!oldSubTask) throw new Error('Sub-task not found');

    const assignee = await this._employeeRepository.findById(data.assignee_id);
    if (assignee) await assignee.populate('user_id');

    const oldAssignee = oldSubTask.assignee_id ? await this._employeeRepository.findById(String(oldSubTask.assignee_id)) : null;
    if (oldAssignee) await oldAssignee.populate('user_id');

    const historyEntry = {
      action: 'assignee_change',
      from: (oldAssignee as unknown as { user_id?: { name: string } })?.user_id?.name || 'Unassigned',
      to: (assignee as unknown as { user_id?: { name: string } })?.user_id?.name || 'Unknown',
      user: assigner._id,
      created_at: new Date(),
    };

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      assignee_id: data.assignee_id,
      assigned_by: assigner._id,
      $push: { history: historyEntry },
    } as unknown as Partial<import('../../models/subTask.model').ISubTask>);

    if (!subTask) throw new Error('Sub-task not found');

    // Send Notification to Assignee
    if (data.assignee_id && String(data.assignee_id) !== String(oldSubTask.assignee_id)) {
      await this._notificationService.createNotification({
        recipientId: data.assignee_id,
        senderId: assigner._id.toString(),
        type: NotificationType.SUBTASK_ASSIGNED,
        title: 'New Sub-task Assigned',
        message: `You have been assigned a new sub-task: ${subTask.title}`,
        link: `/employee/tasks?selectedTask=${subTask._id.toString()}`,
        relatedEntityId: subTask._id.toString(),
        relatedEntityType: 'SubTask',
      });
    }

    return SubTaskMapper.toResponseDTO(subTask);
  }
}
