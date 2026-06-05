import { CreateSubTaskRequestDTO, SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface ICreateSubTaskService {
  execute(data: CreateSubTaskRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<SubTaskResponseDTO>;
}
