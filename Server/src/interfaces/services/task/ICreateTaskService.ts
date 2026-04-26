import { CreateTaskRequestDTO, TaskResponseDTO } from '../../../dto/task.dto';

export interface ICreateTaskService {
  execute(data: CreateTaskRequestDTO, userId: string): Promise<TaskResponseDTO>;
}
