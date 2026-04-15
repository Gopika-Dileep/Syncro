import { injectable, inject } from 'inversify';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IGetTeamsService } from '../../interfaces/services/team/IGetTeamsService';
import { TeamResponseDTO } from '../../dto/team.dto';
import { TeamMapper } from '../../mappers/team.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { TEAM_MESSAGES } from '../../constants/messages';

@injectable()
export class GetTeamsService implements IGetTeamsService {
  constructor(
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
  ) {}

  async execute(userId: string): Promise<TeamResponseDTO[]> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new NotFoundError(TEAM_MESSAGES.COMPANY_NOT_FOUND);

    const teams = await this._teamRepo.find({ company_id: company._id.toString() });
    return TeamMapper.toResponseList(teams);
  }
}
