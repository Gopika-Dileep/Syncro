import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetProjectInsightsService } from '../../interfaces/services/project/IGetProjectInsightsService';
import { ProjectInsightsDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { PROJECT_MESSAGES } from '../../constants/messages';

@injectable()
export class GetProjectInsightsService implements IGetProjectInsightsService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IIssueRepository) private _issueRepo: IIssueRepository,
    @inject(TYPES.ISubTaskRepository) private _subTaskRepo: ISubTaskRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectInsightsDTO> {
    const project = await this._projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(PROJECT_MESSAGES.NOT_FOUND);
    const issues = await this._issueRepo.findAllByProjectId(projectId);

    const issueIds = issues.map((i) => i._id.toString());
    const subTasks: import('../../models/subTask.model').ISubTask[] = [];
    for (const iid of issueIds) {
      const issueSubTasks = await this._subTaskRepo.findAllByIssueId(iid);
      subTasks.push(...issueSubTasks);
    }
    return ProjectMapper.toInsightsDTO(project, issues, subTasks);
  }
}
