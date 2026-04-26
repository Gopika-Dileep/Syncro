import { injectable, inject } from 'inversify';
import { IDeleteTaskService } from '../../interfaces/services/task/IDeleteTaskService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class DeleteTaskService implements IDeleteTaskService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(taskId: string): Promise<void> {
    // 1. Try Task collection
    const task = await this._taskRepository.findById(taskId);
    if (task) {
      await this._taskRepository.deleteById(taskId);
      return;
    }

    // 2. Try UserStory collection (if it's a standalone bug/task)
    const issue = await this._userStoryRepository.findById(taskId);
    if (issue) {
      await this._userStoryRepository.deleteById(taskId);
      return;
    }

    throw new NotFoundError('Task not found');
  }
}
