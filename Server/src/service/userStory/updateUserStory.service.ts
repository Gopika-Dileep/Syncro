import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IUpdateUserStoryService } from '../../interfaces/services/userStory/IUpdateUserStoryService';
import { UpdateUserStoryRequestDTO, UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class UpdateUserStoryService implements IUpdateUserStoryService {
  constructor(
    @inject(TYPES.UserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(storyId: string, data: UpdateUserStoryRequestDTO): Promise<UserStoryResponseDTO> {
    const story = await this._userStoryRepository.updateById(storyId, data);
    if (!story) throw new Error('User story not found');
    return UserStoryMapper.toResponseDTO(story);
  }
}
