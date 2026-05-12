import { CreateSprintRequestDTO, SprintResponseDTO } from '../../../dto/sprint.dto';

export interface ICreateSprintService {
  execute(userId: string, data: CreateSprintRequestDTO): Promise<{ message: string; sprint: SprintResponseDTO }>;
}
