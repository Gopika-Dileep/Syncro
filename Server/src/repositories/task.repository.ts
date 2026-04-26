import { injectable } from 'inversify';
import { ITaskRepository } from '../interfaces/repositories/ITaskRepository';
import { ITask, taskModel } from '../models/task.model';
import { BaseRepository } from './base.repository';

const POPULATE_OPTS = [
  { path: 'team_id', select: 'name' },
  { path: 'assign_to', populate: { path: 'user_id' } },
  { path: 'created_by', populate: { path: 'user_id' } },
  { path: 'assigned_by', populate: { path: 'user_id' } },
];

@injectable()
export class TaskRepository extends BaseRepository<ITask> implements ITaskRepository {
  constructor() {
    super(taskModel);
  }

  async findAllByUserStoryId(userStoryId: string): Promise<ITask[]> {
    return await this._model
      .find({ user_story_id: userStoryId })
      .populate(POPULATE_OPTS)
      .sort({ created_at: -1 })
      .exec();
  }

  async findAllBySprintId(sprintId: string): Promise<ITask[]> {
    return await this._model
      .find({ sprint_id: sprintId })
      .populate(POPULATE_OPTS)
      .sort({ created_at: -1 })
      .exec();
  }

  async findAllByTeamId(teamId: string): Promise<ITask[]> {
    return await this._model
      .find({ team_id: teamId })
      .populate(POPULATE_OPTS)
      .sort({ created_at: -1 })
      .exec();
  }

  async findAllByCompanyId(companyId: string): Promise<ITask[]> {
    return await this._model
      .find({ company_id: companyId })
      .populate(POPULATE_OPTS)
      .sort({ team_id: 1, created_at: -1 })
      .exec();
  }
}

