import { injectable, inject } from 'inversify';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { ICreateTeamService } from '../../interfaces/services/team/ICreateTeamService';
import { TeamResponseDTO } from '../../dto/team.dto';
import { TeamMapper } from '../../mappers/team.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class CreateTeamService implements ICreateTeamService {
  constructor(
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
  ) {}

  async execute(name: string, userId: string): Promise<TeamResponseDTO> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new Error('company not found');

    const resolvedCompanyId = company._id.toString();
    const existing = await this._teamRepo.findOne({ name, company_id: resolvedCompanyId });
    if (existing) throw new Error('this team already exisits');

    const team = await this._teamRepo.create({ name, company_id: resolvedCompanyId });
    return TeamMapper.toResponseDTO(team);
  }
}
