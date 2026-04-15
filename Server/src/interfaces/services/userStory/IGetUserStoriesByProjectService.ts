import { UserStoryResponseDTO } from '../../../dto/userStory.dto';

export interface IGetUserStoriesByProjectService {
  execute(projectId: string): Promise<UserStoryResponseDTO[]>;
}
