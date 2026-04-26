import { injectable, inject } from 'inversify';
import { IAssignTaskService } from '../../interfaces/services/task/IAssignTaskService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { AssignTaskRequestDTO, TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class AssignTaskService implements IAssignTaskService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(taskId: string, data: AssignTaskRequestDTO, userId: string): Promise<TaskResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);
    const assignedBy = employee?._id;

    // 1. Try Task collection
    const task = await this._taskRepository.updateById(taskId, { 
      assign_to: data.assign_to,
      assigned_by: assignedBy
    } as Record<string, unknown>);
    if (task) {
      await task.populate({ path: 'assign_to', populate: { path: 'user_id' } });
      await task.populate({ path: 'created_by', populate: { path: 'user_id' } });
      await task.populate({ path: 'assigned_by', populate: { path: 'user_id' } });
      return TaskMapper.toResponseDTO(task);
    }

    // 2. Try UserStory collection
    const issue = await this._userStoryRepository.updateById(taskId, { 
      assignee_id: data.assign_to,
      assigned_by: assignedBy
    } as Record<string, unknown>);
    if (issue) {
      await issue.populate({ path: 'assignee_id', populate: { path: 'user_id' } });
      await issue.populate({ path: 'created_by', populate: { path: 'user_id' } });
      await issue.populate({ path: 'assigned_by', populate: { path: 'user_id' } });
      return TaskMapper.fromIssue(issue);
    }

    throw new NotFoundError('Task not found');
  }
}
