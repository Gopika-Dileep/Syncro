import {
  CreateUserStoryRequestDTO,
  UpdateUserStoryRequestDTO,
  UserStoryResponseDTO,
} from '../../dto/userStory.dto';

export interface IUserStoryService {
  createUserStory(data: CreateUserStoryRequestDTO): Promise<UserStoryResponseDTO>;
  getUserStoriesByProject(projectId: string): Promise<UserStoryResponseDTO[]>;
  getUserStoryById(storyId: string): Promise<UserStoryResponseDTO>;
  updateUserStory(storyId: string, data: UpdateUserStoryRequestDTO): Promise<UserStoryResponseDTO>;
  deleteUserStory(storyId: string): Promise<void>;
}
