import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IGetProjectInsightsService } from '../../interfaces/services/project/IGetProjectInsightsService';
import { ProjectInsightsDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TaskMapper } from '../../mappers/task.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { PROJECT_MESSAGES } from '../../constants/messages';
import { UserStoryStatus } from '../../enums/UserStoryEnums';

@injectable()
export class GetProjectInsightsService implements IGetProjectInsightsService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepo: IUserStoryRepository,
    @inject(TYPES.ITaskRepository) private _taskRepo: ITaskRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectInsightsDTO> {
    const project = await this._projectRepository.findById(projectId);
    if (!project) throw new NotFoundError(PROJECT_MESSAGES.NOT_FOUND);

    // Get all stories for the project
    const stories = await this._userStoryRepo.findAllByProjectId(projectId);
    
    // Get all tasks for those stories
    const storyIds = stories.map(s => s._id.toString());
    const tasks: any[] = [];
    for (const sid of storyIds) {
        const storyTasks = await this._taskRepo.findAllByUserStoryId(sid);
        tasks.push(...storyTasks);
    }

    // Calculate stats
    const stats = {
        total_stories: stories.filter(s => s.type === 'story').length,
        total_tasks: tasks.length,
        total_bugs: stories.filter(s => s.type === 'bug').length,
        completed_points: stories
            .filter(s => s.status === UserStoryStatus.DONE)
            .reduce((acc, s) => acc + (s.story_points || 0), 0),
        total_points: stories.reduce((acc, s) => acc + (s.story_points || 0), 0),
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

    // Add assignees from stories
    stories.forEach(s => {
        const assignee = s.assignee_id as any;
        if (assignee && assignee.user_id) {
            teamMap.set(assignee._id.toString(), {
                _id: assignee._id.toString(),
                name: assignee.user_id.name || 'Unknown',
                role: assignee.designation || 'Member',
                avatar: assignee.user_id.avatar
            });
        }
    });

    // Add assignees from tasks
    tasks.forEach(t => {
        const assignee = t.assign_to as any;
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
      stories: UserStoryMapper.toResponseList(stories),
      tasks: TaskMapper.toResponseList(tasks),
    };
  }
}
