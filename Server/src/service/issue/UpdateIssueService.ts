import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUpdateIssueService } from '../../interfaces/services/issue/IUpdateIssueService';
import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IssueStatus } from '../../enums/IssueEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';

@injectable()
export class UpdateIssueService implements IUpdateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(issueId: string, data: UpdateIssueRequestDTO): Promise<IssueResponseDTO> {
    const issue = await this._issueRepository.updateById(issueId, data);
    if (!issue) throw new Error('Issue not found');

    if (data.status === IssueStatus.DONE) {
      await this.checkAndCompleteProject(issue.project_id.toString());
    }

    return IssueMapper.toResponseDTO(issue);
  }

  private checkAndCompleteProject = async (projectId: string) => {
    const allIssues = await this._issueRepository.findAllByProjectId(projectId);
    if (allIssues.length > 0 && allIssues.every((i) => i.status === IssueStatus.DONE)) {
      await this._projectRepository.updateById(projectId, { status: ProjectStatus.COMPLETED });
    }
  };
}
