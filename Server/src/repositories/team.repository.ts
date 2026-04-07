import { injectable } from 'inversify';
import { ITeamRepository } from '../interfaces/repositories/ITeamRepository';
import { ITeam, teamModel } from '../models/team.model';
import { BaseRepository } from './base.repository';

@injectable()
export class TeamRepository extends BaseRepository<ITeam> implements ITeamRepository {
  constructor() {
    super(teamModel);
  }
}
