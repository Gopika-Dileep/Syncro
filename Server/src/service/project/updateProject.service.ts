import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUpdateProjectService } from '../../interfaces/services/project/IUpdateProjectService';
import { UpdateProjectRequestDTO, ProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';

@injectable()
export class UpdateProjectService implements IUpdateProjectService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string, data: UpdateProjectRequestDTO): Promise<ProjectResponseDTO> {
    const updateEntity = ProjectMapper.toUpdate(data);
    const project = await this._projectRepository.updateById(projectId, updateEntity);
    if (!project) throw new Error(PROJECT_MESSAGES.NOT_FOUND);
    return ProjectMapper.toResponseDTO(project);
  }
}
