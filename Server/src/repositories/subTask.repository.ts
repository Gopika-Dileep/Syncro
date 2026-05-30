import { injectable } from 'inversify';
import { ISubTaskRepository } from '../interfaces/repositories/ISubTaskRepository';
import { ICreateCommentInput, ICreateAttachmentInput, ICreateHistoryInput } from '../dto/issue.dto';
import { ISubTask, subTaskModel } from '../models/subTask.model';
import { BaseRepository } from './base.repository';

const POPULATE_OPTS = [
  { path: 'issue_id', select: 'title type status' },
  { path: 'sprint_id', select: 'status' },
  { path: 'team_id', select: 'name' },
  { path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] },
  { path: 'created_by', populate: { path: 'user_id' } },
  { path: 'assigned_by', populate: { path: 'user_id' } },
  { path: 'comments.user', populate: { path: 'user_id', select: 'name avatar' } },
  { path: 'history.user', populate: { path: 'user_id', select: 'name avatar' } },
  { path: 'attachments.uploaded_by', populate: { path: 'user_id', select: 'name avatar' } },
];

@injectable()
export class SubTaskRepository extends BaseRepository<ISubTask> implements ISubTaskRepository {
  constructor() {
    super(subTaskModel);
  }

  async findAllByIssueId(issueId: string): Promise<ISubTask[]> {
    return await this._model.find({ issue_id: issueId }).populate(POPULATE_OPTS).sort({ created_at: -1 }).exec();
  }

  async findAllBySprintId(sprintId: string): Promise<ISubTask[]> {
    return await this._model.find({ sprint_id: sprintId }).populate(POPULATE_OPTS).sort({ created_at: -1 }).exec();
  }

  async findAllByTeamId(teamId: string): Promise<ISubTask[]> {
    return await this._model.find({ team_id: teamId }).populate(POPULATE_OPTS).sort({ created_at: -1 }).exec();
  }

  async findAllByCompanyId(companyId: string): Promise<ISubTask[]> {
    return await this._model.find({ company_id: companyId }).populate(POPULATE_OPTS).sort({ team_id: 1, created_at: -1 }).exec();
  }

  async findAllByAssigneeId(assigneeId: string): Promise<ISubTask[]> {
    return await this._model.find({ assignee_id: assigneeId }).populate(POPULATE_OPTS).sort({ created_at: -1 }).exec();
  }

  override async findById(id: string, options?: Record<string, unknown>): Promise<ISubTask | null> {
    return await this._model.findById(id, null, options).populate(POPULATE_OPTS).exec();
  }

  override async updateById(id: string, update: Record<string, unknown>, options?: Record<string, unknown>): Promise<ISubTask | null> {
    return await this._model
      .findByIdAndUpdate(id, update, { new: true, ...options })
      .populate(POPULATE_OPTS)
      .exec();
  }

  async addComment(id: string, comment: ICreateCommentInput): Promise<ISubTask | null> {
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
      .populate(POPULATE_OPTS)
      .exec();
  }

  async addAttachments(id: string, attachments: ICreateAttachmentInput[]): Promise<ISubTask | null> {
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
      .populate(POPULATE_OPTS)
      .exec();
  }

  async updateWithHistory(id: string, update: Record<string, unknown>, history: ICreateHistoryInput | ICreateHistoryInput[]): Promise<ISubTask | null> {
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
      .populate(POPULATE_OPTS)
      .exec();
  }
}
