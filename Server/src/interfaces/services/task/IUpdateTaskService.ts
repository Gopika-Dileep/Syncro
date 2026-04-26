import { UpdateTaskRequestDTO, TaskResponseDTO } from '../../../dto/task.dto';

export interface IUpdateTaskService {
  execute(taskId: string, data: UpdateTaskRequestDTO, userId: string): Promise<TaskResponseDTO>;
}
