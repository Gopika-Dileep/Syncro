import { UpdateUserStoryRequestDTO, UserStoryResponseDTO } from '../../../dto/userStory.dto';

export interface IUpdateUserStoryService {
  execute(storyId: string, data: UpdateUserStoryRequestDTO): Promise<UserStoryResponseDTO>;
}
