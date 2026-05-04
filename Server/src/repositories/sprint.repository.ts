import { injectable } from 'inversify';
import { BaseRepository } from './base.repository';
import { ISprint, sprintModel } from '../models/sprint.model';
import { ISprintRepository } from '../interfaces/repositories/ISprintRepository';

@injectable()
export class SprintRepository extends BaseRepository<ISprint> implements ISprintRepository {
  constructor() {
    super(sprintModel);
  }

  async getSprintsWithPagination(companyId: string, page: number, limit: number, search: string, status?: string): Promise<{ sprints: ISprint[]; total: number }> {
    const filter: Record<string, unknown> = { company_id: companyId };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const total = await this._model.countDocuments(filter);
    const sprints = await this._model
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { sprints, total };
  }
}
