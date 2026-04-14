import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IGetProjectByIdService } from '../../interfaces/services/project/IGetProjectByIdService';
import { ProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';

@injectable()
export class GetProjectByIdService implements IGetProjectByIdService {
  constructor(
    @inject(TYPES.ProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectResponseDTO> {
    const project = await this._projectRepository.findById(projectId);
    if (!project) throw new Error(PROJECT_MESSAGES.NOT_FOUND);
    return ProjectMapper.toResponseDTO(project);
  }
}
