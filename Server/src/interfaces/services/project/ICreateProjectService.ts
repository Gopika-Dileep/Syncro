import { CreateProjectRequestDTO, ProjectResponseDTO } from '../../../dto/project.dto';

export interface ICreateProjectService {
  execute(userId: string, data: CreateProjectRequestDTO): Promise<{ message: string; project: ProjectResponseDTO }>;
}
