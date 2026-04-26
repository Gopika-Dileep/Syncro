import { TaskResponseDTO } from '../../../dto/task.dto';

export interface IGetAllTasksService {
  execute(userId: string): Promise<TaskResponseDTO[]>;
}
