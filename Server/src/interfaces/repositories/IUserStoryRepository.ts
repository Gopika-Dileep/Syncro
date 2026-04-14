import { IUserStory } from '../../models/userStory.model';
import { IBaseRepository } from './IBaseRepository';

export interface IUserStoryRepository extends IBaseRepository<IUserStory> {
  findAllByProjectId(projectId: string): Promise<IUserStory[]>;
}
