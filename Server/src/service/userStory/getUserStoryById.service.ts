import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IGetUserStoryByIdService } from '../../interfaces/services/userStory/IGetUserStoryByIdService';
import { UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { USER_STORY_MESSAGES } from '../../constants/messages';

@injectable()
export class GetUserStoryByIdService implements IGetUserStoryByIdService {
  constructor(@inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository) {}

  async execute(storyId: string): Promise<UserStoryResponseDTO> {
    const story = await this._userStoryRepository.findById(storyId);
    if (!story) throw new NotFoundError(USER_STORY_MESSAGES.NOT_FOUND);
    return UserStoryMapper.toResponseDTO(story);
  }
}
