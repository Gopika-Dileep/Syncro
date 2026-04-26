import { GetSprintRequestDTO, PaginatedSprintResponseDTO } from '../../../dto/sprint.dto';

export interface IGetSprintsService {
  execute(userId: string, query: GetSprintRequestDTO): Promise<{ message: string; data: PaginatedSprintResponseDTO }>;
}
