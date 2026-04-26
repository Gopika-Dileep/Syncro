import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IGetUserStoriesBySprintService } from '../../interfaces/services/userStory/IGetUserStoriesBySprintService';
import { UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class GetUserStoriesBySprintService implements IGetUserStoriesBySprintService {
  constructor(@inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository) {}

  async execute(sprintId: string): Promise<UserStoryResponseDTO[]> {
    const stories = await this._userStoryRepository.findAllBySprintIds([sprintId]);
    return stories.map(story => UserStoryMapper.toResponseDTO(story));
  }
}
