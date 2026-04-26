import { injectable, inject } from 'inversify';
import { ICreateTaskService } from '../../interfaces/services/task/ICreateTaskService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { CreateTaskRequestDTO, TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';

@injectable()
export class CreateTaskService implements ICreateTaskService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(data: CreateTaskRequestDTO, userId: string): Promise<TaskResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);

    const taskData: Record<string, unknown> = {
      ...data,
      company_id: employee?.company_id?._id?.toString() ?? null,
      team_id: employee?.team_id?._id?.toString() ?? null,
      created_by: employee?._id?.toString() ?? null,
    };

    const task = await this._taskRepository.create(taskData);
    
    // Populate for response
    await task.populate({ path: 'assign_to', populate: { path: 'user_id' } });
    await task.populate({ path: 'created_by', populate: { path: 'user_id' } });
    await task.populate({ path: 'assigned_by', populate: { path: 'user_id' } });

    return TaskMapper.toResponseDTO(task);
  }
}

