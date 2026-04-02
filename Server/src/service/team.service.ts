import { injectable, inject } from 'inversify';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { ITeamRepository } from '../interfaces/repositories/ITeamRepository';
import { ITeamService } from '../interfaces/services/ITeamService';
import { ITeam } from '../models/team.model';
import { TYPES } from '../di/types';

@injectable()
export class TeamService implements ITeamService {
  constructor(
    @inject(TYPES.TeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
  ) { }

  async createTeam(name: string, userId: string): Promise<ITeam> {
    const company = await this._companyRepo.findCompanyByUserId(userId);
    if (!company) throw new Error('company not found');

    const resolvedCompanyId = company._id.toString();
    const existing = await this._teamRepo.findByNameAndCompany(name, resolvedCompanyId);
    if (existing) throw new Error('this team already exisits');

    return this._teamRepo.createTeam(name, resolvedCompanyId);
  }

  async getTeams(userId: string): Promise<ITeam[]> {
    const company = await this._companyRepo.findCompanyByUserId(userId);
    if (!company) throw new Error('company not found');

    return this._teamRepo.findByCompanyId(company._id.toString());
  }
}
