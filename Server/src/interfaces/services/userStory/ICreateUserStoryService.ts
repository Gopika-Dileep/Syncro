import { CreateUserStoryRequestDTO, UserStoryResponseDTO } from '../../../dto/userStory.dto';

export interface ICreateUserStoryService {
  execute(data: CreateUserStoryRequestDTO, userId: string): Promise<UserStoryResponseDTO>;
}
