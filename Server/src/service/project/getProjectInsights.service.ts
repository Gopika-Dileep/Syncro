import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetProjectInsightsService } from '../../interfaces/services/project/IGetProjectInsightsService';
import { ProjectInsightsDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { IssueMapper } from '../../mappers/issue.mapper';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { PROJECT_MESSAGES } from '../../constants/messages';
import { IssueStatus } from '../../enums/IssueEnums';

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
    const stats = {
      total_stories: issues.filter((i) => i.type === 'story').length,
      total_tasks: subTasks.length,
      total_bugs: issues.filter((i) => i.type === 'bug').length,
      completed_points: issues.filter((i) => i.status === IssueStatus.DONE).reduce((acc, i) => acc + (i.story_points || 0), 0),
      total_points: issues.reduce((acc, i) => acc + (i.story_points || 0), 0),
    };
    const teamMap = new Map<string, { _id: string; name: string; role: string; avatar?: string }>();

    if (project.created_by) {
      const pm = project.created_by as unknown as Record<string, unknown>;
      const user = pm.user_id as Record<string, unknown>;
      if (user) {
        teamMap.set(String(pm._id), {
          _id: String(pm._id),
          name: String(user.name || 'Project Manager'),
          role: String(pm.designation || 'Project Manager'),
          avatar: user.avatar ? String(user.avatar) : undefined,
        });
      }
    }

    issues.forEach((i) => {
      const assignee = i.assignee_id as unknown as Record<string, unknown> | undefined;
      const user = assignee?.user_id as Record<string, unknown> | undefined;
      if (assignee && user) {
        teamMap.set(String(assignee._id), {
          _id: String(assignee._id),
          name: String(user.name || 'Unknown'),
          role: String(assignee.designation || 'Member'),
          avatar: user.avatar ? String(user.avatar) : undefined,
        });
      }
    });

    subTasks.forEach((st) => {
      const assignee = st.assignee_id as unknown as Record<string, unknown> | undefined;
      const user = assignee?.user_id as Record<string, unknown> | undefined;
      if (assignee && user) {
        teamMap.set(String(assignee._id), {
          _id: String(assignee._id),
          name: String(user.name || 'Unknown'),
          role: String(assignee.designation || 'Member'),
          avatar: user.avatar ? String(user.avatar) : undefined,
        });
      }
    });

    return {
      project: ProjectMapper.toResponseDTO(project),
      stats,
      team: Array.from(teamMap.values()),
      stories: IssueMapper.toResponseList(issues.filter((i) => i.type === 'story')),
      bugs: IssueMapper.toResponseList(issues.filter((i) => i.type === 'bug')),
      subtasks: SubTaskMapper.toResponseList(subTasks),
    };
  }
}
