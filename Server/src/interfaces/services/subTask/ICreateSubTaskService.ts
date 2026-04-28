import { CreateSubTaskRequestDTO, SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface ICreateSubTaskService {
  execute(data: CreateSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO>;
}
