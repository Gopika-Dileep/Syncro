import { injectable } from 'inversify';
import { ISubTaskRepository } from '../interfaces/repositories/ISubTaskRepository';
import { ISubTask, subTaskModel } from '../models/subTask.model';
import { BaseRepository } from './base.repository';

const POPULATE_OPTS = [
  { path: 'issue_id', select: 'title type status' },
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

  override async findById(id: string): Promise<ISubTask | null> {
    return await this._model.findById(id).populate(POPULATE_OPTS).exec();
  }

  override async updateById(id: string, update: Record<string, unknown>): Promise<ISubTask | null> {
    return await this._model.findByIdAndUpdate(id, update, { new: true }).populate(POPULATE_OPTS).exec();
  }
}
