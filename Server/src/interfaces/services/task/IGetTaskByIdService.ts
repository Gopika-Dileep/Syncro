import { TaskResponseDTO } from '../../../dto/task.dto';

export interface IGetTaskByIdService {
  execute(taskId: string): Promise<TaskResponseDTO>;
}
