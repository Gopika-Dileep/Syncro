import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetAssignedSubTasksService {
  execute(userId: string, search: string): Promise<SubTaskResponseDTO[]>;
}
