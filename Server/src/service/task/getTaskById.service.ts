import { injectable, inject } from 'inversify';
import { IGetTaskByIdService } from '../../interfaces/services/task/IGetTaskByIdService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { TYPES } from '../../di/types';
import { TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class GetTaskByIdService implements IGetTaskByIdService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(id: string): Promise<TaskResponseDTO> {
    // 1. Try Task collection
    const task = await this._taskRepository.findById(id);
    if (task) {
      return TaskMapper.toResponseDTO(task);
    }

    // 2. Try UserStory collection
    const issue = await this._userStoryRepository.findById(id);
    if (issue) {
      return TaskMapper.fromIssue(issue);
    }

    throw new NotFoundError('Task not found');
  }
}
