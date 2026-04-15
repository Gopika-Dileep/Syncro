import { ITeam } from '../../models/team.model';
import { IBaseRepository } from './IBaseRepository';

export interface ITeamRepository extends IBaseRepository<ITeam> {
  getTeamsWithPagination(companyId: string, page: number, limit: number, search: string): Promise<{ teams: ITeam[]; total: number }>;
}
