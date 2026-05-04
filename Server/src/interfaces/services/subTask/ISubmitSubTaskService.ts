import { SubmitSubTaskRequestDTO, SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface ISubmitSubTaskService {
  execute(subTaskId: string, data: SubmitSubTaskRequestDTO): Promise<SubTaskResponseDTO>;
}
