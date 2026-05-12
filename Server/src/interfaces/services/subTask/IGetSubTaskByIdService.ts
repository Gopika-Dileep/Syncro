import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetSubTaskByIdService {
  execute(subTaskId: string): Promise<SubTaskResponseDTO>;
}
