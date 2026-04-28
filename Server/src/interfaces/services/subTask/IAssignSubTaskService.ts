import { AssignSubTaskRequestDTO, SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IAssignSubTaskService {
  execute(subTaskId: string, data: AssignSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO>;
}
