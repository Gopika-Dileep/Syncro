import { UpdateProjectRequestDTO, ProjectResponseDTO } from '../../../dto/project.dto';

export interface IUpdateProjectService {
  execute(projectId: string, data: UpdateProjectRequestDTO, userId?: string): Promise<ProjectResponseDTO>;
}
