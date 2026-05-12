import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IStartSubTaskService {
  execute(subTaskId: string, userId: string): Promise<SubTaskResponseDTO>;
}
