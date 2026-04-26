import { UserStoryResponseDTO } from '../../../dto/userStory.dto';

export interface IGetUserStoriesBySprintService {
  execute(sprintId: string): Promise<UserStoryResponseDTO[]>;
}
