import { GetProjectsRequestDTO, PaginatedProjectResponseDTO } from '../../../dto/project.dto';

export interface IGetProjectsService {
  execute(userId: string, query: GetProjectsRequestDTO): Promise<PaginatedProjectResponseDTO>;
}
