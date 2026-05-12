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

  async execute(issueId: string, data: UpdateIssueRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<IssueResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const oldIssue = await this._issueRepository.findById(issueId);
    if (!oldIssue) throw new Error('Issue not found');

    // SECURITY CHECK: If changing sprint, verify specific permission and status
    if (data.sprint_id && String(data.sprint_id) !== String(oldIssue.sprint_id)) {
      const isCompany = userRole === 'company';
      const type = (oldIssue.type || 'task').toLowerCase();
      const hasSprintPerm = permissions.includes(`issue:${type}:assign_to_sprint`);
      
      if (!isCompany && !hasSprintPerm) {
        throw new Error(`You do not have permission to add this ${type} to a sprint`);
      }

      // NEW: Status Check - Only 'Ready' items can be moved from backlog to sprint
      if (!oldIssue.sprint_id && oldIssue.status !== 'Ready') {
        throw new Error(`Only items with status 'Ready' can be added to a sprint. Please mark this ${type} as ready first.`);
      }
    }

    const historyEntry = {
      user: employee?._id,
      created_at: new Date(),
      action: 'updated' as string,
      from: undefined as string | undefined,
      to: undefined as string | undefined,
    };

    if (data.status && data.status !== oldIssue.status) {
      if (data.status === IssueStatus.BLOCKED && !data.blocked_reason) {
        throw new Error('Blocked reason is required when blocking an issue');
      }
      historyEntry.action = 'status_change';
      historyEntry.from = oldIssue.status;
      historyEntry.to = data.status;
    }

    const issue = await this._issueRepository.updateById(issueId, {
      ...data,
      $push: { history: historyEntry },
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
