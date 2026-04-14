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
    return await this._model.find({ project_id: projectId }).sort({ created_at: -1 }).exec();
  }
}
