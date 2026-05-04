import { injectable } from 'inversify';
import { IIssueRepository } from '../interfaces/repositories/IIssueRepository';
import { IIssue, issueModel } from '../models/issue.model';
import { BaseRepository } from './base.repository';

@injectable()
export class IssueRepository extends BaseRepository<IIssue> implements IIssueRepository {
  constructor() {
    super(issueModel);
  }

  private readonly POPULATE_OPTS = [
    { path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] },
    { path: 'created_by', populate: { path: 'user_id' } },
    { path: 'assigned_by', populate: { path: 'user_id' } },
    { path: 'comments.user', populate: { path: 'user_id', select: 'name avatar' } },
  ];

  async findAllByProjectId(projectId: string): Promise<IIssue[]> {
    return await this._model.find({ project_id: projectId }).populate(this.POPULATE_OPTS).sort({ created_at: -1 }).exec();
  }

  async findAllBySprintIds(sprintIds: string[]): Promise<IIssue[]> {
    return await this._model
      .find({ sprint_id: { $in: sprintIds } })
      .populate(this.POPULATE_OPTS)
      .exec();
  }

  async findPopulated(filter: Record<string, unknown>): Promise<IIssue[]> {
    return await this._model.find(filter).populate(this.POPULATE_OPTS).exec();
  }

  override async findById(id: string): Promise<IIssue | null> {
    return await this._model.findById(id).populate(this.POPULATE_OPTS).exec();
  }
}
