import { injectable, inject } from 'inversify';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IGetTeamsService } from '../../interfaces/services/team/IGetTeamsService';
import { GetTeamsRequestDTO, PaginatedTeamResponseDTO } from '../../dto/team.dto';
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

  async execute(userId: string, query: GetTeamsRequestDTO): Promise<PaginatedTeamResponseDTO> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (!company) throw new NotFoundError(TEAM_MESSAGES.COMPANY_NOT_FOUND);

    const { teams, total } = await this._teamRepo.getTeamsWithPagination(company._id.toString(), query.page, query.limit, query.search);
    return {
      teams: TeamMapper.toResponseList(teams),
      total,
    };
  }
}
