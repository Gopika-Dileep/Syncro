import { injectable } from 'inversify';
import { ITeamRepository } from '../interfaces/repositories/ITeamRepository';
import { ITeam, teamModel } from '../models/team.model';

@injectable()
export class TeamRepository implements ITeamRepository {
  async createTeam(name: string, companyId: string): Promise<ITeam> {
    return await teamModel.create({ name, company_id: companyId });
  }

  async findByCompanyId(companyId: string): Promise<ITeam[]> {
    return await teamModel.find({ company_id: companyId });
  }

  async findByNameAndCompany(name: string, companyId: string): Promise<ITeam | null> {
    return await teamModel.findOne({ name, company_id: companyId });
  }
}
