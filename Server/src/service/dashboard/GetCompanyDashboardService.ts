import mongoose from 'mongoose';
import { injectable, inject } from 'inversify';
import { IGetCompanyDashboardService } from '../../interfaces/services/dashboard/IGetCompanyDashboardService';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { CompanyDashboardDTO } from '../../dto/dashboard.dto';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IssueType, IssueStatus } from '../../enums/IssueEnums';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IIssue } from '../../models/issue.model';

@injectable()
export class GetCompanyDashboardService implements IGetCompanyDashboardService {
  constructor(
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.IProjectRepository) private _projectRepo: IProjectRepository,
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.IIssueRepository) private _issueRepo: IIssueRepository,
    @inject(TYPES.ISprintRepository) private _sprintRepo: ISprintRepository,
    @inject(TYPES.ISubTaskRepository) private _subTaskRepo: ISubTaskRepository,
  ) {}

  async execute(userId: string): Promise<CompanyDashboardDTO> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new NotFoundError('Company not found');

    const companyId = company._id;
    const companyIdStr = companyId.toString();

    const [totalEmployees, totalProjects, totalTeams, completedSprints, totalSprints, issueStats, statusStats, recentBlocked] = await Promise.all([
      this._employeeRepo.count({ company_id: companyId }),
      this._projectRepo.count({ company_id: companyId }),
      this._teamRepo.count({ company_id: companyId }),
      this._sprintRepo.count({ company_id: companyId, status: 'Completed' }),
      this._sprintRepo.count({ company_id: companyId }),
      this.getIssueStats(companyIdStr),
      this.getStatusStats(companyIdStr),
      this._issueRepo.find({ company_id: companyId, status: IssueStatus.BLOCKED }, { sort: { updated_at: -1 }, limit: 5 }),
    ]);

    return {
      totalEmployees,
      totalProjects,
      totalTeams,
      completedSprints,
      totalSprints,
      issueStats,
      statusDistribution: statusStats,
      recentBlocked: (recentBlocked as IIssue[]).map((i) => ({
        _id: i._id.toString(),
        title: i.title,
        priority: i.priority,
        blocked_reason: i.blocked_reason,
        updated_at: i.updated_at,
      })),
    };
  }

  private async getIssueStats(companyId: string) {
    const objId = new mongoose.Types.ObjectId(companyId);
    const [stories, tasks, bugs, subTasks] = await Promise.all([
      this._issueRepo.count({ company_id: objId, type: IssueType.STORY }),
      this._issueRepo.count({ company_id: objId, type: IssueType.TASK }),
      this._issueRepo.count({ company_id: objId, type: IssueType.BUG }),
      this._subTaskRepo.count({ company_id: objId }),
    ]);
    const total = stories + tasks + bugs + subTasks;
    return { total, stories, tasks: tasks + subTasks, bugs };
  }

  private async getStatusStats(companyId: string) {
    const objId = new mongoose.Types.ObjectId(companyId);
    const [issueTodo, issueIP, issueIR, issueBlocked, issueDone, stTodo, stIP, stIR, stBlocked, stDone] = await Promise.all([
      this._issueRepo.count({ company_id: objId, status: { $in: [IssueStatus.NEW, IssueStatus.READY, IssueStatus.TODO] } }),
      this._issueRepo.count({ company_id: objId, status: IssueStatus.IN_PROGRESS }),
      this._issueRepo.count({ company_id: objId, status: IssueStatus.IN_REVIEW }),
      this._issueRepo.count({ company_id: objId, status: IssueStatus.BLOCKED }),
      this._issueRepo.count({ company_id: objId, status: IssueStatus.DONE }),
      this._subTaskRepo.count({ company_id: objId, status: SubTaskStatus.TODO }),
      this._subTaskRepo.count({ company_id: objId, status: SubTaskStatus.IN_PROGRESS }),
      this._subTaskRepo.count({ company_id: objId, status: SubTaskStatus.IN_REVIEW }),
      this._subTaskRepo.count({ company_id: objId, status: SubTaskStatus.BLOCKED }),
      this._subTaskRepo.count({ company_id: objId, status: SubTaskStatus.DONE }),
    ]);

    return {
      todo: issueTodo + stTodo,
      inProgress: issueIP + stIP,
      inReview: issueIR + stIR,
      blocked: issueBlocked + stBlocked,
      done: issueDone + stDone,
    };
  }
}
