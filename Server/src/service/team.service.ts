import { injectable, inject } from 'inversify';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { ITeamRepository } from '../interfaces/repositories/ITeamRepository';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';
import { ITeamService } from '../interfaces/services/ITeamService';
import { TeamResponseDTO } from '../dto/team.dto';
import { TeamMapper } from '../mappers/team.mapper';
import { TYPES } from '../di/types';

@injectable()
export class TeamService implements ITeamService {
  constructor(
    @inject(TYPES.TeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async createTeam(name: string, userId: string): Promise<TeamResponseDTO> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');

    const resolvedCompanyId = company._id.toString();
    const existing = await this._teamRepo.findOne({ name, company_id: resolvedCompanyId });
    if (existing) throw new Error('this team already exisits');

    const team = await this._teamRepo.create({ name, company_id: resolvedCompanyId });
    return TeamMapper.toResponseDTO(team);
  }

  async getTeams(userId: string): Promise<TeamResponseDTO[]> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');

    const teams = await this._teamRepo.find({ company_id: company._id.toString() });
    return TeamMapper.toResponseList(teams);
  }

  async updateTeam(teamId: string, name: string): Promise<TeamResponseDTO> {
    const updated = await this._teamRepo.updateById(teamId, { name });
    if (!updated) throw new Error('team not found or update failed');
    return TeamMapper.toResponseDTO(updated);
  }

  async deleteTeam(teamId: string): Promise<void> {
    const deleted = await this._teamRepo.deleteById(teamId);
    if (!deleted) throw new Error('team not found');

    await this._employeeRepo.updateMany({ team_id: teamId }, { team_id: null });
  }
}
