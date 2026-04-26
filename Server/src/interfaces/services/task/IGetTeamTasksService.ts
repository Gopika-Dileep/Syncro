import { TaskResponseDTO } from '../../../dto/task.dto';

export interface IGetTeamTasksService {
  execute(userId: string): Promise<TaskResponseDTO[]>;
}
