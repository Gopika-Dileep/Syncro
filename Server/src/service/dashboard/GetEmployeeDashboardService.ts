import { injectable, inject } from 'inversify';
import { IGetEmployeeDashboardService } from '../../interfaces/services/dashboard/IGetEmployeeDashboardService';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { EmployeeDashboardDTO } from '../../dto/dashboard.dto';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IssueStatus, IssueType } from '../../enums/IssueEnums';
import mongoose from 'mongoose';

import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';

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

  async execute(userId: string, permissions: string[]): Promise<EmployeeDashboardDTO> {
    const objUserId = new mongoose.Types.ObjectId(userId);
    const employee = await this._employeeRepo.findOne({ user_id: objUserId });
    if (!employee) throw new NotFoundError('Employee profile not found');

    const employeeId = employee._id;
    const teamId = employee.team_id;
    const companyId = employee.company_id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const empIdObj = new mongoose.Types.ObjectId(employeeId.toString());

    // Check if user has Lead/Manager permissions
    // Lead: has coordination permissions (assign/manage) for their team
    // Manager: has global executive scope (:all)
    const hasLeadPermissions = permissions.some(p => 
      p.includes('sprint:start') || 
      p.includes('sprint:complete') || 
      p.includes('task:view:team')
    );
    const hasAllScope = permissions.some(p => p.includes(':all'));

    const [issueStats, subTaskStats, team, typeStats, upcomingTasks] = await Promise.all([
      this._issueRepo.find({ 
        $or: [{ assignee_id: empIdObj }, { assignee_id: userIdObj }] 
      }),
      this._subTaskRepo.find({ 
        $or: [{ assignee_id: empIdObj }, { assignee_id: userIdObj }] 
      }),
      teamId ? this._teamRepo.findById(teamId.toString()) : Promise.resolve(null),
      this.getEmployeeTypeStats(empIdObj),
      this.getUpcomingTasks(empIdObj)
    ]);

    const matchStatus = (item: any, target: string) => 
      (item.status || '').toLowerCase() === target.toLowerCase();

    const isNotStory = (item: any) => (item.type || '').toLowerCase() !== 'story';

    const issueWorkItems = issueStats.filter(isNotStory);

    const stats = {
      totalAssigned: issueWorkItems.length + subTaskStats.length,
      completed: issueWorkItems.filter(i => matchStatus(i, 'Done')).length + subTaskStats.filter(s => matchStatus(s, 'Done')).length,
      inProgress: issueWorkItems.filter(i => matchStatus(i, 'In Progress') || matchStatus(i, 'In Review')).length + subTaskStats.filter(s => matchStatus(s, 'In Progress') || matchStatus(s, 'In Review')).length,
      blocked: issueWorkItems.filter(i => matchStatus(i, 'Blocked')).length + subTaskStats.filter(s => matchStatus(s, 'Blocked')).length,
    };

    let teamStats;
    let teamMetrics;
    let managerMetrics;
    let myFocus;

    // Developer Focus Data
    const currentTask = [...issueWorkItems, ...subTaskStats].find(i => matchStatus(i, 'In Progress'));
    const totalDoneToday = [...issueWorkItems, ...subTaskStats].filter(i => matchStatus(i, 'Done')).length;
    myFocus = {
      currentTask: currentTask ? { _id: currentTask._id, title: currentTask.title, priority: currentTask.priority } : undefined,
      dailyProgress: totalDoneToday > 0 ? Math.min(100, (totalDoneToday / 5) * 100) : 0, // Aim for 5 tasks/day
    };

    // Handle Team/Company Aggregation for Leads and Managers
    // STRICT ROLE SEPARATION:
    // 1. Manager: Has :all scope AND NO assigned team (Top Level)
    // 2. Lead: Has coordination permissions AND has an assigned team
    // 3. Developer: Default view
    // Handle Team/Company Aggregation for Leads and Managers
    // ROLE DETECTION BASED ON DESIGNATION
    const designation = (employee.designation || '').toLowerCase();
    
    // 1. Manager: Unassigned to a team AND has high-level designation or scope
    const isManager = !teamId && (designation.includes('manager') || hasAllScope);
    
    // 2. Lead: Assigned to a team AND has lead designation or permissions
    const isLead = !!teamId && (designation.includes('lead') || designation.includes('leader') || hasLeadPermissions);

    console.log(`[DASHBOARD DEBUG] UserID: ${userId}, Designation: ${employee.designation}, Role: ${isManager ? 'MANAGER' : isLead ? 'LEAD' : 'DEVELOPER'}, TeamID: ${teamId}`);

    if (isManager || isLead) {
      let teamMembers: any[] = [];
      let allTeamItems: any[] = [];
      let activeSprintData;
      let companyEmployeesList: any[] = [];
      let recentBlockedItems: any[] = [];

      // 1. FETCH BASE DATA
      if (isManager && !teamId) {
        // Pure Manager: Global Scope
        const [companyIssues, companySubTasks, companyEmployees, companySprints] = await Promise.all([
          this._issueRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) }),
          this._subTaskRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) }),
          this._employeeRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) }, { populate: 'user_id' }),
          this._sprintRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) })
        ]);
        allTeamItems = [...companyIssues, ...companySubTasks];
        teamMembers = companyEmployees;
        companyEmployeesList = companyEmployees;

        // For Manager Progress/Health: Use ONLY User Stories
        const managerProgressItems = companyIssues.filter(i => (i.type || '').toLowerCase() === 'story');

        const activeSprint = companySprints.find(s => (s.status || '').toLowerCase() === 'active');
        if (activeSprint) {
          // For Active Sprint Card: Manager sees the same as Lead (No Stories, just work items)
          const sprintItems = allTeamItems.filter(i => 
            i.sprint_id?.toString() === activeSprint._id.toString() && 
            isNotStory(i)
          );
          activeSprintData = {
            endDate: activeSprint.end_date.toISOString(),
            completedTasks: sprintItems.filter(i => matchStatus(i, 'Done')).length,
            incompleteTasks: sprintItems.filter(i => !matchStatus(i, 'Done')).length
          };
        }
        recentBlockedItems = await this.getRecentBlockedItems({ company_id: new mongoose.Types.ObjectId(companyId.toString()) });
      } else {
        // Lead OR Manager-with-Team: Team Scope
        const [companyEmployees, companySprints] = await Promise.all([
          this._employeeRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) }, { populate: 'user_id' }),
          this._sprintRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) })
        ]);
        companyEmployeesList = companyEmployees;

        let members = [];
        let teamIssues = [];
        let teamSubTasks = [];

        if (teamId) {
          members = companyEmployees.filter(m => m.team_id?.toString() === teamId.toString());
          const memberIds = members.map(m => m._id);

          teamSubTasks = await this._subTaskRepo.find({ team_id: new mongoose.Types.ObjectId(teamId.toString()) });
          const parentIssueIds = [...new Set(teamSubTasks.map(st => st.issue_id.toString()))];
          
          teamIssues = await this._issueRepo.find({ 
            $or: [
              { assignee_id: { $in: memberIds } },
              { _id: { $in: parentIssueIds.map(id => new mongoose.Types.ObjectId(id)) } }
            ]
          });
        } else {
          // Lead without a specific team: Show items they are involved in
          members = [employee];
          teamIssues = await this._issueRepo.find({ created_by: empIdObj });
          teamSubTasks = await this._subTaskRepo.find({ created_by: empIdObj });
        }

        teamMembers = members;
        allTeamItems = [...teamIssues.filter(isNotStory), ...teamSubTasks];

        const activeSprint = companySprints.find(s => (s.status || '').toLowerCase() === 'active');
        if (activeSprint) {
          const sprintItems = allTeamItems.filter(i => i.sprint_id?.toString() === activeSprint._id.toString());
          activeSprintData = {
            endDate: activeSprint.end_date.toISOString(),
            completedTasks: sprintItems.filter(i => matchStatus(i, 'Done')).length,
            incompleteTasks: sprintItems.filter(i => !matchStatus(i, 'Done')).length
          };
        }
        if (teamId) {
          recentBlockedItems = await this.getRecentBlockedItems({ team_id: new mongoose.Types.ObjectId(teamId.toString()) });
        }
      }

      // 3. DEFINE UNIFIED WORK ITEMS
      // For Manager: Actionable items for main stats are Issues (Stories, Tasks, Bugs)
      // For Lead: Actionable items are Tasks, Bugs, and Subtasks (Stories are excluded)
      const actionableItems = isManager && !teamId 
        ? allTeamItems.filter(i => i.type && (i.type || '').toLowerCase() !== 'subtask')
        : allTeamItems.filter(isNotStory);

      const completedItems = actionableItems.filter(i => matchStatus(i, 'Done'));
      const workingOnItems = actionableItems.filter(i => matchStatus(i, 'In Progress') || matchStatus(i, 'In Review'));

      const workloadMap = new Map<string, number>();
      actionableItems.forEach(item => {
        const key = item.assignee_id?.toString() || 'Unassigned';
        workloadMap.set(key, (workloadMap.get(key) || 0) + 1);
      });

      const workloadDistribution = Array.from(workloadMap.entries()).map(([id, count]) => {
        const member = companyEmployeesList.find(m => 
          m._id.toString() === id || 
          (m.user_id && m.user_id._id?.toString() === id) ||
          (m.user_id && m.user_id.toString() === id)
        );
        const memberItems = actionableItems.filter(i => i.assignee_id?.toString() === id);
        const completedCount = memberItems.filter(i => matchStatus(i, 'Done')).length;
        
        return {
          assigneeName: id === 'Unassigned' ? 'Unassigned' : (member ? (member.user_id?.name || (member as any).name) : 'Unknown Member'),
          designation: member?.designation || '',
          taskCount: count,
          completedCount: completedCount
        };
      });

      teamMetrics = {
        totalAssigned: actionableItems.length,
        completed: completedItems.length,
        inProgress: workingOnItems.length, // SUM OF IN PROGRESS + IN REVIEW
        blocked: actionableItems.filter(i => matchStatus(i, 'Blocked')).length,
        statusDistribution: {
          todo: actionableItems.filter(i => matchStatus(i, 'To Do')).length,
          inProgress: actionableItems.filter(i => matchStatus(i, 'In Progress')).length,
          inReview: actionableItems.filter(i => matchStatus(i, 'In Review')).length,
          blocked: actionableItems.filter(i => matchStatus(i, 'Blocked')).length,
          done: completedItems.length,
        },
        workloadDistribution,
        activeSprint: activeSprintData,
        recentBlocked: recentBlockedItems
      };

      if (isManager) {
        const companyIssues = allTeamItems.filter(i => (i as any).type);
        const uniqueProjects = new Set(companyIssues.map(i => (i as any).project_id?.toString())).size;
        const companySprints = await this._sprintRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) });
        const companyTeams = await this._teamRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) });

        // For Manager Health: Use all Issues (Story, Task, Bug), exclude Subtasks
        const managerIssueWorkItems = allTeamItems.filter(i => i.type && (i.type || '').toLowerCase() !== 'subtask'); // Issues have 'type', subtasks have 'issue_id'
        const managerCompletedIssues = managerIssueWorkItems.filter(i => matchStatus(i, 'Done'));

        managerMetrics = {
          companyHealthScore: managerIssueWorkItems.length > 0 ? Math.round((managerCompletedIssues.length / managerIssueWorkItems.length) * 100) : 100,
          totalActiveProjects: uniqueProjects,
          globalVelocity: 0,
          completionTrend: [],
          totalTeams: companyTeams.length,
          totalSprints: companySprints.length,
          completedSprints: companySprints.filter(s => (s.status || '').toLowerCase() === 'completed').length,
          globalTypeStats: {
            stories: allTeamItems.filter(i => (i.type || '').toLowerCase() === 'story').length,
            bugs: allTeamItems.filter(i => (i.type || '').toLowerCase() === 'bug').length,
            tasks: allTeamItems.filter(i => (i.type || '').toLowerCase() === 'task').length, // ONLY Issue Tasks
            subtasks: allTeamItems.filter(i => i.issue_id).length // Subtasks have issue_id (parent)
          },
          projectStatus: await (async () => {
            const companyProjects = await this._projectRepo.find({ company_id: new mongoose.Types.ObjectId(companyId.toString()) });
            return companyProjects.map(project => {
              // Project progress for Manager is based on all ISSUES (Story, Task, Bug)
              const projectIssues = allTeamItems.filter(i => 
                i.project_id?.toString() === project._id.toString() && 
                i.type // Only issues have the type field in the main collection
              );
              const totalItems = projectIssues.length;
              const completedItems = projectIssues.filter(i => matchStatus(i, 'Done')).length;
              return {
                name: project.name,
                progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
                totalItems,
                completedItems
              };
            });
          })(),
          recentBlocked: recentBlockedItems
        };
      }
    }

    if (team) {
      const teamIdObj = new mongoose.Types.ObjectId((team as any)._id.toString());
      const teamMembersCount = await this._employeeRepo.count({ team_id: teamIdObj });
      
      teamStats = {
        teamName: (team as any).name,
        totalMembers: teamMembersCount > 0 ? teamMembersCount - 1 : 0,
        teamVelocity: 0,
      };
    }

    return {
      myStats: stats,
      typeStats,
      teamStats,
      teamMetrics,
      managerMetrics,
      myFocus: {
        currentTask: myFocus?.currentTask ? {
          _id: myFocus.currentTask._id.toString(),
          title: myFocus.currentTask.title,
          priority: myFocus.currentTask.priority.toString()
        } : undefined,
        dailyProgress: myFocus?.dailyProgress || 0
      },
      upcomingDeadlines: (upcomingTasks as any[]).map(t => ({
        _id: t._id.toString(),
        title: t.title,
        priority: t.priority,
        status: t.status
      })),
      recentActivity: [],
      debug: {
        userId: userId.toString(),
        employeeId: employeeId.toString(),
        permissions: permissions
      }
    };
  }







  private async getUpcomingTasks(employeeId: mongoose.Types.ObjectId) {
    const issues = await this._issueRepo.find(
      { 
        assignee_id: employeeId, 
        status: { $ne: IssueStatus.DONE },
        type: { $ne: IssueType.STORY }
      },
      { limit: 5, sort: { created_at: -1 } }
    );
    const subTasks = await this._subTaskRepo.find(
      { assignee_id: employeeId, status: { $ne: SubTaskStatus.DONE } },
      { limit: 5, sort: { created_at: -1 } }
    );
    return [...issues, ...subTasks].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()).slice(0, 5);
  }

  private async getEmployeeTypeStats(employeeId: mongoose.Types.ObjectId) {
    const subTasks = await this._subTaskRepo.find({ assignee_id: employeeId });
    if (subTasks.length === 0) return { stories: 0, tasks: 0, bugs: 0 };

    const issueIds = [...new Set(subTasks.map(st => st.issue_id.toString()))];
    const issues = await this._issueRepo.find({ 
      _id: { $in: issueIds.map(id => new mongoose.Types.ObjectId(id)) } 
    });
    
    const stats = { stories: 0, tasks: 0, bugs: 0 };
    issues.forEach(issue => {
      const type = (issue.type || '').toLowerCase();
      if (type === 'story') stats.stories++;
      else if (type === 'bug') stats.bugs++;
      else stats.tasks++;
    });

    return stats;
  }

  private async getRecentBlockedItems(filter: any) {
    const [issues, subTasks] = await Promise.all([
      this._issueRepo.find({ ...filter, status: IssueStatus.BLOCKED, type: { $ne: IssueType.STORY } }, { sort: { updated_at: -1 }, limit: 5 }),
      this._subTaskRepo.find({ ...filter, status: SubTaskStatus.BLOCKED }, { sort: { updated_at: -1 }, limit: 5 })
    ]);

    const combined = [
      ...issues.map((i: any) => ({
        _id: i._id.toString(),
        title: i.title,
        priority: i.priority,
        blocked_reason: i.blocked_reason,
        updated_at: i.updated_at,
        type: i.type
      })),
      ...subTasks.map((s: any) => ({
        _id: s._id.toString(),
        title: s.title,
        priority: s.priority,
        blocked_reason: s.blocked_reason,
        updated_at: s.updated_at,
        type: 'sub-task'
      }))
    ];

    return combined.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime()).slice(0, 5);
  }
}
