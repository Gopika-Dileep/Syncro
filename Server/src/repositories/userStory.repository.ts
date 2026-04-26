import { injectable } from 'inversify';
import { IUserStoryRepository } from '../interfaces/repositories/IUserStoryRepository';
import { IUserStory, userStoryModel } from '../models/userStory.model';
import { BaseRepository } from './base.repository';

@injectable()
export class UserStoryRepository extends BaseRepository<IUserStory> implements IUserStoryRepository {
  constructor() {
    super(userStoryModel);
  }

  async findAllByProjectId(projectId: string): Promise<IUserStory[]> {
    return await this._model.find({ project_id: projectId })
      .populate({ path: 'assignee_id', populate: { path: 'user_id' } })
      .populate({ path: 'created_by', populate: { path: 'user_id' } })
      .populate({ path: 'assigned_by', populate: { path: 'user_id' } })
      .sort({ created_at: -1 }).exec();
  }

  async findAllBySprintIds(sprintIds: string[]): Promise<IUserStory[]> {
    return await this._model.find({ sprint_id: { $in: sprintIds } })
      .populate({ path: 'assignee_id', populate: { path: 'user_id' } })
      .populate({ path: 'created_by', populate: { path: 'user_id' } })
      .populate({ path: 'assigned_by', populate: { path: 'user_id' } })
      .exec();
  }

  async findPopulated(filter: Record<string, unknown>): Promise<IUserStory[]> {
    return await this._model.find(filter)
      .populate({ path: 'assignee_id', populate: { path: 'user_id' } })
      .populate({ path: 'created_by', populate: { path: 'user_id' } })
      .populate({ path: 'assigned_by', populate: { path: 'user_id' } })
      .exec();
  }
}
