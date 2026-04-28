import { injectable } from 'inversify';
import { IIssueRepository } from '../interfaces/repositories/IIssueRepository';
import { IIssue, issueModel } from '../models/issue.model';
import { BaseRepository } from './base.repository';

@injectable()
export class IssueRepository extends BaseRepository<IIssue> implements IIssueRepository {
  constructor() {
    super(issueModel);
  }

  async findAllByProjectId(projectId: string): Promise<IIssue[]> {
    return await this._model.find({ project_id: projectId })
      .populate({ path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] })
      .populate({ path: 'created_by', populate: { path: 'user_id' } })
      .populate({ path: 'assigned_by', populate: { path: 'user_id' } })
      .sort({ created_at: -1 }).exec();
  }

  async findAllBySprintIds(sprintIds: string[]): Promise<IIssue[]> {
    return await this._model.find({ sprint_id: { $in: sprintIds } })
      .populate({ path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] })
      .populate({ path: 'created_by', populate: { path: 'user_id' } })
      .populate({ path: 'assigned_by', populate: { path: 'user_id' } })
      .exec();
  }

  async findPopulated(filter: Record<string, unknown>): Promise<IIssue[]> {
    return await this._model.find(filter)
      .populate({ path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] })
      .populate({ path: 'created_by', populate: { path: 'user_id' } })
      .populate({ path: 'assigned_by', populate: { path: 'user_id' } })
      .exec();
  }
}
