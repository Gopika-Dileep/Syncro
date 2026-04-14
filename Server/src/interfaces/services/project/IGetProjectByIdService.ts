import { ProjectResponseDTO } from '../../../dto/project.dto';

export interface IGetProjectByIdService {
  execute(projectId: string): Promise<ProjectResponseDTO>;
}
