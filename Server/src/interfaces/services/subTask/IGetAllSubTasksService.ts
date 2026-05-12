import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetAllSubTasksService {
  execute(userId: string, search: string): Promise<SubTaskResponseDTO[]>;
}
