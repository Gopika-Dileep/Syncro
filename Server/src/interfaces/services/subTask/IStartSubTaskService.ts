import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IStartSubTaskService {
  execute(subTaskId: string): Promise<SubTaskResponseDTO>;
}
