import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IGetUserStoriesByProjectService } from '../../interfaces/services/userStory/IGetUserStoriesByProjectService';
import { UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class GetUserStoriesByProjectService implements IGetUserStoriesByProjectService {
  constructor(@inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository) {}

  async execute(projectId: string): Promise<UserStoryResponseDTO[]> {
    const stories = await this._userStoryRepository.findAllByProjectId(projectId);
    return UserStoryMapper.toResponseList(stories);
  }
}
