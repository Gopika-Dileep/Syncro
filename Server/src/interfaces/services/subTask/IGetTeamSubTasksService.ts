import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetTeamSubTasksService {
  execute(userId: string, search: string): Promise<SubTaskResponseDTO[]>;
}
