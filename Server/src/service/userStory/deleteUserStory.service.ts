import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IDeleteUserStoryService } from '../../interfaces/services/userStory/IDeleteUserStoryService';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { USER_STORY_MESSAGES } from '../../constants/messages';

@injectable()
export class DeleteUserStoryService implements IDeleteUserStoryService {
  constructor(@inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository) {}

  async execute(storyId: string): Promise<void> {
    const result = await this._userStoryRepository.deleteById(storyId);
    if (!result) throw new NotFoundError(USER_STORY_MESSAGES.NOT_FOUND);
    return;
  }
}
