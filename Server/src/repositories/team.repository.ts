import { injectable } from 'inversify';
import { ITeamRepository } from '../interfaces/repositories/ITeamRepository';
import { ITeam, teamModel } from '../models/team.model';
import { BaseRepository } from './base.repository';

@injectable()
export class TeamRepository extends BaseRepository<ITeam> implements ITeamRepository {
  constructor() {
    super(teamModel);
  }

  async getTeamsWithPagination(companyId: string, page: number, limit: number, search: string): Promise<{ teams: ITeam[]; total: number }> {
    const filter: Record<string, unknown> = { company_id: companyId };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const total = await this._model.countDocuments(filter);
    const teams = await this._model
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { teams, total };
  }
}
