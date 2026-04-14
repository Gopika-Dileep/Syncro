import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IDeleteUserStoryService } from '../../interfaces/services/userStory/IDeleteUserStoryService';
import { TYPES } from '../../di/types';

@injectable()
export class DeleteUserStoryService implements IDeleteUserStoryService {
  constructor(
    @inject(TYPES.UserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(storyId: string): Promise<void> {
    const result = await this._userStoryRepository.deleteById(storyId);
    if (!result) throw new Error('User story not found');
    return;
  }
}
