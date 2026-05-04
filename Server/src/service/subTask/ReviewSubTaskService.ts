import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IReviewSubTaskService } from '../../interfaces/services/subTask/IReviewSubTaskService';
import { ReviewSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IssueStatus } from '../../enums/IssueEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';

@injectable()
export class ReviewSubTaskService implements IReviewSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(subTaskId: string, data: ReviewSubTaskRequestDTO): Promise<SubTaskResponseDTO> {
    const status = data.action === 'approve' ? SubTaskStatus.DONE : SubTaskStatus.IN_PROGRESS;


    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      status,
      rework_reason: data.rework_reason,
    });

    if (subTask) {
      if (status === SubTaskStatus.DONE) {
        const issueId = subTask.issue_id.toString();
        const allSubTasks = await this._subTaskRepository.findAllByIssueId(issueId);
        if (allSubTasks.every((st) => st.status === SubTaskStatus.DONE)) {
          const updatedIssue = await this._issueRepository.updateById(issueId, { status: IssueStatus.DONE });
          if (updatedIssue) {
            await this.checkAndCompleteProject(updatedIssue.project_id.toString());
          }
        }
      }
      return SubTaskMapper.toResponseDTO(subTask);
    }


    const issue = await this._issueRepository.updateById(subTaskId, {
      status: status === SubTaskStatus.DONE ? IssueStatus.DONE : IssueStatus.IN_PROGRESS,
      rework_reason: data.rework_reason,
    });

    if (issue) {
      if (status === SubTaskStatus.DONE) {
        await this.checkAndCompleteProject(issue.project_id.toString());
      }
      return SubTaskMapper.fromIssue(issue);
    }

    throw new Error('Task not found');
  }

  private async checkAndCompleteProject(projectId: string) {
    const allIssues = await this._issueRepository.findAllByProjectId(projectId);
    if (allIssues.length > 0 && allIssues.every((i) => i.status === IssueStatus.DONE)) {
      await this._projectRepository.updateById(projectId, { status: ProjectStatus.COMPLETED });
    }
  }
}
