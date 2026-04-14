import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IGetUserStoryByIdService } from '../../interfaces/services/userStory/IGetUserStoryByIdService';
import { UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class GetUserStoryByIdService implements IGetUserStoryByIdService {
  constructor(
    @inject(TYPES.UserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(storyId: string): Promise<UserStoryResponseDTO> {
    const story = await this._userStoryRepository.findById(storyId);
    if (!story) throw new Error('User story not found');
    return UserStoryMapper.toResponseDTO(story);
  }
}
