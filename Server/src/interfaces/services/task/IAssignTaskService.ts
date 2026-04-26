import { AssignTaskRequestDTO, TaskResponseDTO } from '../../../dto/task.dto';

export interface IAssignTaskService {
  execute(taskId: string, data: AssignTaskRequestDTO, userId: string): Promise<TaskResponseDTO>;
}
