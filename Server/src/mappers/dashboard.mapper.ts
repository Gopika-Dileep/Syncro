import { IProject } from '../models/project.model';
import { ISprint } from '../models/sprint.model';
import { ITeam } from '../models/team.model';
import { IIssue } from '../models/issue.model';
import { ISubTask } from '../models/subTask.model';
import { BlockedItem, UpcomingDeadlineItem } from '../dto/dashboard.dto';

export class DashboardMapper {
  static toAvailableFilters(projects: IProject[], sprints: ISprint[], teams: ITeam[]) {
    return {
      projects: projects.map((p) => ({ _id: p._id.toString(), name: p.name })),
      sprints: sprints.map((s) => ({ _id: s._id.toString(), name: s.name, sprint_number: s.sprint_number })),
      teams: teams.map((t) => ({ _id: t._id.toString(), name: t.name })),
    };
  }

  static toUpcomingDeadlineItems(issues: IIssue[], subTasks: ISubTask[]): UpcomingDeadlineItem[] {
    return [
      ...issues.map((i) => ({
        _id: i._id.toString(),
        title: i.title,
        priority: i.priority,
        status: i.status,
        updated_at: i.updated_at.toISOString(),
      })),
      ...subTasks.map((s) => ({
        _id: s._id.toString(),
        title: s.title,
        priority: s.priority,
        status: s.status,
        updated_at: s.updated_at.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      .slice(0, 5);
  }

  static toRecentBlockedItems(issues: IIssue[], subTasks: ISubTask[]): BlockedItem[] {
    return [
      ...issues.map((i) => ({
        _id: i._id.toString(),
        title: i.title,
        type: i.type,
        priority: i.priority,
        blocked_reason: i.blocked_reason,
        updated_at: i.updated_at.toISOString(),
      })),
      ...subTasks.map((s) => ({
        _id: s._id.toString(),
        title: s.title,
        type: 'sub-task',
        priority: s.priority,
        blocked_reason: s.blocked_reason,
        updated_at: s.updated_at.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }

  static toWorkloadDistribution(teamMembers: any[], teamSubTasks: ISubTask[], teamIssues: IIssue[]) {
    return teamMembers.map((m) => {
      const mTasks = teamSubTasks.filter((s) => s.assignee_id?.toString() === m._id.toString());
      const mIssues = teamIssues.filter((i) => i.assignee_id?.toString() === m._id.toString());
      return {
        assigneeName: m.user_id?.name || 'Unknown',
        taskCount: mTasks.length + mIssues.length,
        completedCount: mTasks.filter((s) => s.status === 'Done').length + mIssues.filter((i) => i.status === 'Done').length,
        avatar: m.user_id?.avatar,
        designation: m.designation,
      };
    });
  }

  static toProjectProgress(project: IProject, total: number, done: number) {
    return {
      name: project.name,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      totalItems: total,
      completedItems: done,
    };
  }

  static toCompanyRecentBlocked(recentBlocked: IIssue[]): BlockedItem[] {
    return recentBlocked.map((i) => ({
      _id: i._id.toString(),
      title: i.title,
      priority: i.priority,
      blocked_reason: i.blocked_reason,
      updated_at: i.updated_at,
    }));
  }
}
