import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IAutoAssignSubTaskService {
  execute(subTaskId: string, userId: string, permissions: string[], userRole?: string): Promise<SubTaskResponseDTO>;
}
