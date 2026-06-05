import { injectable } from 'inversify';
import { IIssueRepository } from '../interfaces/repositories/IIssueRepository';
import { ICreateCommentInput, ICreateAttachmentInput, ICreateHistoryInput } from '../dto/issue.dto';
import { IIssue, issueModel } from '../models/issue.model';
import { BaseRepository } from './base.repository';
import { IssueType } from '../enums/IssueEnums';

@injectable()
export class IssueRepository extends BaseRepository<IIssue> implements IIssueRepository {
  constructor() {
    super(issueModel);
  }

  private readonly POPULATE_OPTS = [
    { path: 'sprint_id', select: 'status' },
    { path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] },
    { path: 'created_by', populate: { path: 'user_id' } },
    { path: 'assigned_by', populate: { path: 'user_id' } },
    { path: 'comments.user', populate: { path: 'user_id', select: 'name avatar' } },
    { path: 'history.user', populate: { path: 'user_id', select: 'name avatar' } },
    { path: 'attachments.uploaded_by', populate: { path: 'user_id', select: 'name avatar' } },
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

  override async findById(id: string, options?: Record<string, unknown>): Promise<IIssue | null> {
    return await this._model.findById(id, null, options).populate(this.POPULATE_OPTS).exec();
  }

  override async updateById(id: string, update: Record<string, unknown>, options?: Record<string, unknown>): Promise<IIssue | null> {
    return await this._model
      .findByIdAndUpdate(id, update, { new: true, ...options })
      .populate(this.POPULATE_OPTS)
      .exec();
  }

  async addComment(id: string, comment: ICreateCommentInput): Promise<IIssue | null> {
    return await this._model
      .findByIdAndUpdate(
        id,
        {
          $push: {
            comments: {
              ...comment,
              created_at: new Date(),
            },
          },
        },
        { new: true },
      )
      .populate(this.POPULATE_OPTS)
      .exec();
  }

  async addAttachments(id: string, attachments: ICreateAttachmentInput[]): Promise<IIssue | null> {
    return await this._model
      .findByIdAndUpdate(
        id,
        {
          $push: {
            attachments: { $each: attachments },
          },
        },
        { new: true },
      )
      .populate(this.POPULATE_OPTS)
      .exec();
  }

  async updateWithHistory(id: string, update: Record<string, unknown>, history: ICreateHistoryInput | ICreateHistoryInput[]): Promise<IIssue | null> {
    const historyArray = Array.isArray(history) ? history : [history];
    if (historyArray.length === 0) {
      return await this.updateById(id, update);
    }
    return await this._model
      .findByIdAndUpdate(
        id,
        {
          ...update,
          $push: {
            history: {
              $each: historyArray.map((h) => ({ ...h, created_at: new Date() })),
            },
          },
        },
        { new: true },
      )
      .populate(this.POPULATE_OPTS)
      .exec();
  }

  async findActiveByAssigneeId(assigneeId: string): Promise<IIssue[]> {
    return await this._model
      .find({
        assignee_id: assigneeId,
        status: { $nin: ['Done'] },
      })
      .exec();
  }

  async findActiveTasksAndBugs(companyId: string, filters?: { assigneeId?: string; assigneeIds?: string[] }): Promise<IIssue[]> {
    const query: Record<string, unknown> = {
      company_id: companyId,
      type: { $in: [IssueType.TASK, IssueType.BUG] },
      status: { $ne: 'Backlog' },
    };

    if (filters?.assigneeId) {
      query.assignee_id = filters.assigneeId;
    } else if (filters?.assigneeIds) {
      query.assignee_id = { $in: filters.assigneeIds };
    }

    return await this._model.find(query).populate(this.POPULATE_OPTS).exec();
  }
}
