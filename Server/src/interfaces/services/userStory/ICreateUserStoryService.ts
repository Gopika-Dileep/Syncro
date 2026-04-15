import { CreateUserStoryRequestDTO, UserStoryResponseDTO } from '../../../dto/userStory.dto';

export interface ICreateUserStoryService {
  execute(data: CreateUserStoryRequestDTO): Promise<UserStoryResponseDTO>;
}
