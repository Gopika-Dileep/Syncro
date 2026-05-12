import { SprintResponseDTO } from '../../../dto/sprint.dto';

export interface IGetSprintByIdService {
  execute(sprintId: string): Promise<{ message: string; data: SprintResponseDTO }>;
}
