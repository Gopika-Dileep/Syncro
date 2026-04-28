import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetAllSubTasksService {
  execute(userId: string): Promise<SubTaskResponseDTO[]>;
}
