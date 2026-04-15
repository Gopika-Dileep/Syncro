import { UserStoryResponseDTO } from '../../../dto/userStory.dto';

export interface IGetUserStoryByIdService {
  execute(storyId: string): Promise<UserStoryResponseDTO>;
}
