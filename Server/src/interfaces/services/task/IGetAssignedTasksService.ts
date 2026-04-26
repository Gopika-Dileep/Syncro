import { TaskResponseDTO } from '../../../dto/task.dto';

export interface IGetAssignedTasksService {
  execute(userId: string): Promise<TaskResponseDTO[]>;
}
