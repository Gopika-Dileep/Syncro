import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IUpdateUserStoryService } from '../../interfaces/services/userStory/IUpdateUserStoryService';
import { UpdateUserStoryRequestDTO, UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { USER_STORY_MESSAGES } from '../../constants/messages';

@injectable()
export class UpdateUserStoryService implements IUpdateUserStoryService {
  constructor(@inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository) {}

  async execute(storyId: string, data: UpdateUserStoryRequestDTO): Promise<UserStoryResponseDTO> {
    const story = await this._userStoryRepository.updateById(storyId, data);
    if (!story) throw new NotFoundError(USER_STORY_MESSAGES.NOT_FOUND);
    return UserStoryMapper.toResponseDTO(story);
  }
}
