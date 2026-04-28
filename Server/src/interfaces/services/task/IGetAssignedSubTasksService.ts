import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetAssignedSubTasksService {
  execute(userId: string): Promise<SubTaskResponseDTO[]>;
}
