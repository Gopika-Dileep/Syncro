import { IProject } from '../models/project.model';
import { ProjectResponseDTO, CreateProjectRequestDTO, UpdateProjectRequestDTO, ProjectInsightsDTO } from '../dto/project.dto';
import { Types } from 'mongoose';
import { IIssue } from '../models/issue.model';
import { ISubTask } from '../models/subTask.model';
import { IssueMapper } from './issue.mapper';
import { SubTaskMapper } from './subTask.mapper';

export class ProjectMapper {
  static toResponseDTO(project: IProject): ProjectResponseDTO {
    const creator = project.created_by as unknown as Record<string, unknown> | undefined;
    const user = creator?.user_id as Record<string, unknown> | undefined;
    return {
      _id: (project._id as Types.ObjectId).toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      company_id: (project.company_id as Types.ObjectId).toString(),
      start_date: project.start_date.toISOString(),
      target_date: project.target_date.toISOString(),
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
      created_by:
        creator && user
          ? {
              _id: String(creator._id),
              name: String(user.name || 'Unknown'),
              avatar: user.avatar ? String(user.avatar) : undefined,
              designation: creator.designation ? String(creator.designation) : undefined,
            }
          : undefined,
    };
  }

  static toResponseList(projects: IProject[]): ProjectResponseDTO[] {
    return projects.map((project) => this.toResponseDTO(project));
  }

  static toCreate(data: CreateProjectRequestDTO, companyId: string, createdBy: string): Partial<IProject> {
    return {
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      start_date: new Date(data.start_date),
      target_date: new Date(data.target_date),
      company_id: new Types.ObjectId(companyId),
      created_by: new Types.ObjectId(createdBy),
    };
  }

  static toUpdate(data: UpdateProjectRequestDTO): Partial<IProject> {
    const update: Record<string, unknown> = { ...data };
    if (data.start_date) update.start_date = new Date(data.start_date);
    if (data.target_date) update.target_date = new Date(data.target_date);
    return update as Partial<IProject>;
  }

  static toInsightsDTO(project: IProject, issues: IIssue[], subTasks: ISubTask[]): ProjectInsightsDTO {
    const stats = {
      total_stories: issues.filter((i) => i.type === 'story').length,
      total_tasks: subTasks.length,
      total_bugs: issues.filter((i) => i.type === 'bug').length,
      completed_points: issues.filter((i) => i.status === 'Done').reduce((acc, i) => acc + (i.story_points || 0), 0),
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
      project: this.toResponseDTO(project),
      stats,
      team: Array.from(teamMap.values()),
      stories: IssueMapper.toResponseList(issues.filter((i) => i.type === 'story')),
      standaloneTasks: IssueMapper.toResponseList(issues.filter((i) => i.type === 'task')),
      bugs: IssueMapper.toResponseList(issues.filter((i) => i.type === 'bug')),
      tasks: SubTaskMapper.toResponseList(subTasks),
    };
  }
}
