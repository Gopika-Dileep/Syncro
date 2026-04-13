import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import { IUserStoryService } from '../interfaces/services/IUserStoryService';
import { IUserStoryRepository } from '../interfaces/repositories/IUserStoryRepository';
import { TYPES } from '../di/types';
import { UserStoryResponseDTO, CreateUserStoryRequestDTO, UpdateUserStoryRequestDTO } from '../dto/userStory.dto';
import { UserStoryMapper } from '../mappers/userStory.mapper';

@injectable()
export class UserStoryService implements IUserStoryService {
  constructor(
    @inject(TYPES.UserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async createUserStory(data: CreateUserStoryRequestDTO): Promise<UserStoryResponseDTO> {
    const userStory = await this._userStoryRepository.create({
      ...data,
      project_id: new Types.ObjectId(data.project_id),
    });
    return UserStoryMapper.toResponseDTO(userStory);
  }

  async getUserStoriesByProject(projectId: string): Promise<UserStoryResponseDTO[]> {
    const stories = await this._userStoryRepository.findAllByProjectId(projectId);
    return UserStoryMapper.toResponseList(stories);
  }

  async getUserStoryById(storyId: string): Promise<UserStoryResponseDTO> {
    const story = await this._userStoryRepository.findById(storyId);
    if (!story) throw new Error('User story not found');
    return UserStoryMapper.toResponseDTO(story);
  }

  async updateUserStory(storyId: string, data: UpdateUserStoryRequestDTO): Promise<UserStoryResponseDTO> {
    const story = await this._userStoryRepository.updateById(storyId, data);
    if (!story) throw new Error('User story not found');
    return UserStoryMapper.toResponseDTO(story);
  }

  async deleteUserStory(storyId: string): Promise<void> {
    const result = await this._userStoryRepository.deleteById(storyId);
    if (!result) throw new Error('User story not found');
  }
}
