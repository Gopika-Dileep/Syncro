import { injectable, inject } from 'inversify';
import { IGetEmployeeDashboardService } from '../../interfaces/services/dashboard/IGetEmployeeDashboardService';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { EmployeeDashboardDTO, DashboardFilter } from '../../dto/dashboard.dto';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import mongoose from 'mongoose';

import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IProject } from '../../models/project.model';
import { ISprint } from '../../models/sprint.model';
import { ITeam } from '../../models/team.model';
import { IIssue } from '../../models/issue.model';
import { ISubTask } from '../../models/subTask.model';
import { IPopulatedEmployee } from '../../models/employee.model';

@injectable()
export class GetEmployeeDashboardService implements IGetEmployeeDashboardService {
  constructor(
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.ISubTaskRepository) private _subTaskRepo: ISubTaskRepository,
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.ISprintRepository) private _sprintRepo: ISprintRepository,
    @inject(TYPES.IIssueRepository) private _issueRepo: IIssueRepository,
    @inject(TYPES.IProjectRepository) private _projectRepo: IProjectRepository,
  ) {}

  async execute(userId: string, permissions: string[], filter?: DashboardFilter): Promise<EmployeeDashboardDTO> {
    const objUserId = new mongoose.Types.ObjectId(userId);
    const employee = await this._employeeRepo.findOne({ user_id: objUserId });
    if (!employee) throw new NotFoundError('Employee profile not found');

    const employeeId = employee._id;
    const teamId = employee.team_id;
    const companyId = employee.company_id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const empIdObj = new mongoose.Types.ObjectId(employeeId.toString());

    const designation = (employee.designation || '').toLowerCase();
    const hasManagerScope = permissions.some(p => 
      p === '*:*' || 
      p === '*:all' || 
      p === 'company:all' || 
      p === 'dashboard:manager'
    );
    
    const isManager = hasManagerScope || designation === 'manager' || designation.includes('general manager') || designation.includes('ceo');

    const hasLeadPermissions = permissions.some(p => 
      p.includes('sprint:start') || 
      p.includes('sprint:complete') || 
      p === 'task:view:team' ||
      p === 'dashboard:lead'
    );
    
    const isLead = !isManager && !!teamId && (
      designation.includes('lead') || 
      designation.includes('leader') || 
      hasLeadPermissions
    );

    let availableProjects: IProject[] = [];
    let availableSprints: ISprint[] = [];
    let availableTeams: ITeam[] = [];

    if (isManager) {
      const [projects, sprints, teams] = await Promise.all([
        this._projectRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) }),
        this._sprintRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) }),
        this._teamRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) })
      ]);
      availableProjects = projects;
      availableSprints = sprints;
      availableTeams = teams;
    } else {
      const [involvedIssues, involvedSubTasks] = await Promise.all([
        this._issueRepo.find({ $or: [{ assignee_id: empIdObj }, { assignee_id: userIdObj }] }),
        this._subTaskRepo.find({ $or: [{ assignee_id: empIdObj }, { assignee_id: userIdObj }] })
      ]);
      
      const stIssueIds = [...new Set(involvedSubTasks.map(s => s.issue_id.toString()))];
      const stParentIssues = await this._issueRepo.find({ _id: { $in: stIssueIds.map(id => new mongoose.Types.ObjectId(id)) } });

      const pIds = new Set([
        ...involvedIssues.map(i => i.project_id?.toString()), 
        ...stParentIssues.map(i => i.project_id?.toString())
      ].filter(Boolean) as string[]);
      
      const sIds = new Set([
        ...involvedIssues.map(i => i.sprint_id?.toString()), 
        ...involvedSubTasks.map(s => s.sprint_id?.toString())
      ].filter(Boolean) as string[]);
      
      [availableProjects, availableSprints] = await Promise.all([
        this._projectRepo.find({ _id: { $in: Array.from(pIds).map(id => new mongoose.Types.ObjectId(id)) } }),
        this._sprintRepo.find({ _id: { $in: Array.from(sIds).map(id => new mongoose.Types.ObjectId(id)) } })
      ]);
    }

    const baseFilter: Record<string, unknown> = {};
    const subTaskFilter: Record<string, unknown> = {};
    if (filter?.projectId) {
        const pId = new mongoose.Types.ObjectId(filter.projectId);
        baseFilter['project_id'] = pId;
        const projectIssues = await this._issueRepo.find({ project_id: pId });
        subTaskFilter['issue_id'] = { $in: projectIssues.map(i => i._id) };
    }
    if (filter?.sprintId) {
        const sId = new mongoose.Types.ObjectId(filter.sprintId);
        baseFilter['sprint_id'] = sId;
        subTaskFilter['sprint_id'] = sId;
    }

    const [issueStats, subTaskStats, team, typeStats, upcomingTasks] = await Promise.all([
      this._issueRepo.find({ 
        $or: [{ assignee_id: empIdObj }, { assignee_id: userIdObj }],
        ...baseFilter
      }),
      this._subTaskRepo.find({ 
        $or: [{ assignee_id: empIdObj }, { assignee_id: userIdObj }],
        ...subTaskFilter
      }),
      teamId ? this._teamRepo.findById(teamId.toString()) : Promise.resolve(null),
      this.getEmployeeTypeStats(empIdObj, baseFilter, subTaskFilter),
      this.getUpcomingTasks(empIdObj, baseFilter, subTaskFilter)
    ]);

    const matchStatus = (item: { status: string }, target: string) => 
      (item.status || '').toLowerCase() === target.toLowerCase();

    const isNotStory = (item: { type: string }) => (item.type || '').toLowerCase() !== 'story';

    const issueWorkItems = (issueStats as IIssue[]).filter(isNotStory);

    const stats = {
      totalAssigned: issueWorkItems.length + subTaskStats.length,
      completed: issueWorkItems.filter(i => matchStatus(i, 'Done')).length + subTaskStats.filter(s => matchStatus(s, 'Done')).length,
      inProgress: issueWorkItems.filter(i => matchStatus(i, 'In Progress') || matchStatus(i, 'In Review')).length + subTaskStats.filter(s => matchStatus(s, 'In Progress') || matchStatus(s, 'In Review')).length,
      blocked: issueWorkItems.filter(i => matchStatus(i, 'Blocked')).length + subTaskStats.filter(s => matchStatus(s, 'Blocked')).length,
    };

    let teamStatsData;
    let teamMetricsData;
    let managerMetricsData;

    if (isManager) {
        const [activeProjectsCount, allSprints, allTeamsCount, globalTypeStats, recentBlocked] = await Promise.all([
            this._projectRepo.count({ company_id: companyId, status: 'Active' }),
            this._sprintRepo.find({ company_id: companyId }),
            this._teamRepo.count({ company_id: companyId }),
            this.getEmployeeTypeStats(new mongoose.Types.ObjectId(), { company_id: companyId }, { company_id: companyId }),
            this.getRecentBlockedItems({ company_id: companyId })
        ]);

        const projectList = await this._projectRepo.find({ company_id: companyId });
        const projectStatus = await Promise.all(projectList.slice(0, 5).map(async p => {
            const [total, done] = await Promise.all([
                this._issueRepo.count({ project_id: p._id }),
                this._issueRepo.count({ project_id: p._id, status: 'Done' })
            ]);
            return {
                name: p.name,
                progress: total > 0 ? Math.round((done / total) * 100) : 0,
                totalItems: total,
                completedItems: done
            };
        }));

        managerMetricsData = {
            companyHealthScore: 0,
            totalActiveProjects: activeProjectsCount,
            globalVelocity: 0,
            completionTrend: [],
            totalTeams: allTeamsCount,
            totalSprints: allSprints.length,
            completedSprints: allSprints.filter(s => s.status === 'Completed').length,
            globalTypeStats: {
                stories: globalTypeStats.stories,
                tasks: globalTypeStats.tasks,
                bugs: globalTypeStats.bugs,
                subtasks: globalTypeStats.subtasks
            },
            projectStatus,
            recentBlocked
        };
    } else if (isLead && teamId) {
        const [teamMembers, teamSubTasks, teamIssues, recentBlocked] = await Promise.all([
            this._employeeRepo.find({ team_id: teamId }, { populate: 'user_id' }),
            this._subTaskRepo.find({ team_id: teamId, ...subTaskFilter }),
            this._issueRepo.find({ team_id: teamId, ...baseFilter }),
            this.getRecentBlockedItems({ team_id: teamId })
        ]);

        const workloadDistribution = (teamMembers as unknown as IPopulatedEmployee[]).map(m => {
            const mTasks = teamSubTasks.filter(s => s.assignee_id?.toString() === m._id.toString());
            const mIssues = teamIssues.filter(i => i.assignee_id?.toString() === m._id.toString());
            return {
                assigneeName: m.user_id?.name || 'Unknown',
                taskCount: mTasks.length + mIssues.length,
                completedCount: mTasks.filter(s => s.status === 'Done').length + mIssues.filter(i => i.status === 'Done').length,
                avatar: m.user_id?.avatar,
                designation: m.designation
            };
        });

        const activeSprint = await this._sprintRepo.findOne({ team_id: teamId, status: 'Active' });
        let sprintData;
        if (activeSprint) {
            const [stCount, stDone, iCount, iDone] = await Promise.all([
                this._subTaskRepo.count({ sprint_id: activeSprint._id }),
                this._subTaskRepo.count({ sprint_id: activeSprint._id, status: 'Done' }),
                this._issueRepo.count({ sprint_id: activeSprint._id }),
                this._issueRepo.count({ sprint_id: activeSprint._id, status: 'Done' })
            ]);
            sprintData = {
                endDate: activeSprint.end_date.toISOString(),
                completedTasks: stDone + iDone,
                incompleteTasks: (stCount + iCount) - (stDone + iDone)
            };
        }

        teamStatsData = {
            teamName: team?.name || 'My Team',
            totalMembers: teamMembers.length,
            teamVelocity: 0
        };

        teamMetricsData = {
            totalAssigned: teamSubTasks.length + teamIssues.length,
            completed: teamSubTasks.filter(s => s.status === 'Done').length + teamIssues.filter(i => i.status === 'Done').length,
            inProgress: teamSubTasks.filter(s => s.status === 'In Progress').length + teamIssues.filter(i => i.status === 'In Progress').length,
            blocked: teamSubTasks.filter(s => s.status === 'Blocked').length + teamIssues.filter(i => i.status === 'Blocked').length,
            statusDistribution: {
                todo: teamSubTasks.filter(s => s.status === 'To Do').length + teamIssues.filter(i => i.status === 'To Do').length,
                inProgress: teamSubTasks.filter(s => s.status === 'In Progress').length + teamIssues.filter(i => i.status === 'In Progress').length,
                inReview: teamSubTasks.filter(s => s.status === 'In Review').length + teamIssues.filter(i => i.status === 'In Review').length,
                blocked: teamSubTasks.filter(s => s.status === 'Blocked').length + teamIssues.filter(i => i.status === 'Blocked').length,
                done: teamSubTasks.filter(s => s.status === 'Done').length + teamIssues.filter(i => i.status === 'Done').length,
            },
            workloadDistribution,
            activeSprint: sprintData,
            recentBlocked
        };
    }

    return {
      myStats: stats,
      typeStats,
      teamStats: teamStatsData,
      teamMetrics: teamMetricsData,
      managerMetrics: managerMetricsData,
      upcomingDeadlines: upcomingTasks,
      recentActivity: [],
      availableFilters: {
        projects: availableProjects.map(p => ({ _id: p._id.toString(), name: p.name })),
        sprints: availableSprints.map(s => ({ _id: s._id.toString(), name: s.name, sprint_number: s.sprint_number })),
        teams: availableTeams.map(t => ({ _id: t._id.toString(), name: t.name }))
      }
    };
  }

  private async getUpcomingTasks(employeeId: mongoose.Types.ObjectId, filter: Record<string, unknown> = {}, stFilter: Record<string, unknown> = {}) {
    const [issues, subTasks] = await Promise.all([
      this._issueRepo.find({ assignee_id: employeeId, status: { $ne: 'Done' }, ...filter }, { sort: { due_date: 1 }, limit: 5 }),
      this._subTaskRepo.find({ assignee_id: employeeId, status: { $ne: 'Done' }, ...stFilter }, { limit: 5 })
    ]);

    return [
      ...issues.map(i => ({ _id: i._id.toString(), title: i.title, priority: i.priority, status: i.status, updated_at: i.updated_at.toISOString() })),
      ...subTasks.map(s => ({ _id: s._id.toString(), title: s.title, priority: s.priority, status: s.status, updated_at: s.updated_at.toISOString() }))
    ].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()).slice(0, 5);
  }

  private async getEmployeeTypeStats(employeeId: mongoose.Types.ObjectId, filter: Record<string, unknown> = {}, stFilter: Record<string, unknown> = {}) {
    const isGlobal = employeeId.toString() === new mongoose.Types.ObjectId().toString();
    const query = isGlobal ? filter : { ...filter, assignee_id: employeeId };
    const stQuery = isGlobal ? stFilter : { ...stFilter, assignee_id: employeeId };

    const [stories, bugs, tasks, subtasks] = await Promise.all([
      this._issueRepo.count({ ...query, type: 'story' }),
      this._issueRepo.count({ ...query, type: 'bug' }),
      this._issueRepo.count({ ...query, type: 'task' }),
      this._subTaskRepo.count(stQuery)
    ]);

    return {
      stories,
      bugs,
      tasks: tasks + subtasks,
      subtasks
    };
  }

  private async getRecentBlockedItems(filter: Record<string, unknown>) {
    const [issues, subTasks] = await Promise.all([
      this._issueRepo.find({ ...filter, status: 'Blocked' }, { sort: { updated_at: -1 }, limit: 5 }),
      this._subTaskRepo.find({ ...filter, status: 'Blocked' }, { sort: { updated_at: -1 }, limit: 5 })
    ]);

    return [
      ...(issues as IIssue[]).map(i => ({
        _id: i._id.toString(),
        title: i.title,
        type: i.type,
        priority: i.priority,
        blocked_reason: i.blocked_reason,
        updated_at: i.updated_at.toISOString()
      })),
      ...(subTasks as ISubTask[]).map(s => ({
        _id: s._id.toString(),
        title: s.title,
        type: 'sub-task',
        priority: s.priority,
        blocked_reason: s.blocked_reason,
        updated_at: s.updated_at.toISOString()
      }))
    ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);
  }
}
