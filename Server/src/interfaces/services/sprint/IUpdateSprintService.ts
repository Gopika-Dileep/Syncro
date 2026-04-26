import { UpdateSprintRequestDTO, SprintResponseDTO } from '../../../dto/sprint.dto';

export interface IUpdateSprintService {
  execute(sprintId: string, data: UpdateSprintRequestDTO): Promise<{ message: string; sprint: SprintResponseDTO }>;
}
