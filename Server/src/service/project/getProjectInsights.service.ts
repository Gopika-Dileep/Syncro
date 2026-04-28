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

    // Get all issues for the project
    const issues = await this._issueRepo.findAllByProjectId(projectId);
    
    // Get all sub-tasks for those issues
    const issueIds = issues.map(i => i._id.toString());
    const subTasks: any[] = [];
    for (const iid of issueIds) {
        const issueSubTasks = await this._subTaskRepo.findAllByIssueId(iid);
        subTasks.push(...issueSubTasks);
    }

    // Calculate stats
    const stats = {
        total_stories: issues.filter(i => i.type === 'story').length,
        total_tasks: subTasks.length,
        total_bugs: issues.filter(i => i.type === 'bug').length,
        completed_points: issues
            .filter(i => i.status === IssueStatus.DONE)
            .reduce((acc, i) => acc + (i.story_points || 0), 0),
        total_points: issues.reduce((acc, i) => acc + (i.story_points || 0), 0),
    };

    // Extract unique team members
    const teamMap = new Map<string, any>();
    
    // Add creator (PM)
    if (project.created_by) {
        const pm = project.created_by as any;
        if (pm.user_id) {
            teamMap.set(pm._id.toString(), {
                _id: pm._id.toString(),
                name: pm.user_id.name || 'Project Manager',
                role: pm.designation || 'Project Manager',
                avatar: pm.user_id.avatar
            });
        }
    }

    // Add assignees from issues
    issues.forEach(i => {
        const assignee = i.assignee_id as any;
        if (assignee && assignee.user_id) {
            teamMap.set(assignee._id.toString(), {
                _id: assignee._id.toString(),
                name: assignee.user_id.name || 'Unknown',
                role: assignee.designation || 'Member',
                avatar: assignee.user_id.avatar
            });
        }
    });

    // Add assignees from sub-tasks
    subTasks.forEach(st => {
        const assignee = st.assign_to as any;
        if (assignee && assignee.user_id) {
            teamMap.set(assignee._id.toString(), {
                _id: assignee._id.toString(),
                name: assignee.user_id.name || 'Unknown',
                role: assignee.designation || 'Member',
                avatar: assignee.user_id.avatar
            });
        }
    });

    return {
      project: ProjectMapper.toResponseDTO(project),
      stats,
      team: Array.from(teamMap.values()),
      stories: IssueMapper.toResponseList(issues),
      tasks: SubTaskMapper.toResponseList(subTasks),
    };
  }
}
