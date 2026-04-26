import { TaskResponseDTO } from '../../../dto/task.dto';

export interface IGetTasksByUserStoryService {
  execute(userId: string, userStoryId: string): Promise<TaskResponseDTO[]>;
}
