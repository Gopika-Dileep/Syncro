import { UpdateSubTaskRequestDTO, SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IUpdateSubTaskService {
  execute(subTaskId: string, data: UpdateSubTaskRequestDTO): Promise<SubTaskResponseDTO>;
}
