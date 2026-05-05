import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUpdateIssueService } from '../../interfaces/services/issue/IUpdateIssueService';
import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IssueStatus } from '../../enums/IssueEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class UpdateIssueService implements IUpdateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(issueId: string, data: UpdateIssueRequestDTO, userId: string): Promise<IssueResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const oldIssue = await this._issueRepository.findById(issueId);
    if (!oldIssue) throw new Error('Issue not found');

    const historyEntry: any = {
      user: employee?._id,
      created_at: new Date(),
    };

    if (data.status && data.status !== oldIssue.status) {
      historyEntry.action = 'status_change';
      historyEntry.from = oldIssue.status;
      historyEntry.to = data.status;
    } else {
      historyEntry.action = 'updated';
    }

    const issue = await this._issueRepository.updateById(issueId, {
      ...data,
      $push: { history: historyEntry }
    });
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
