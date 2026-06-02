import { injectable, inject } from 'inversify';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
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
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(userId: string, query: GetTeamsRequestDTO): Promise<PaginatedTeamResponseDTO> {
    let companyId: string;

    const company = await this._companyRepo.findOne({ user_id: userId });
    if (company) {
      companyId = company._id.toString();
    } else {
      const employee = await this._employeeRepo.findOne({ user_id: userId });
      if (!employee) throw new NotFoundError(TEAM_MESSAGES.COMPANY_NOT_FOUND);
      companyId = employee.company_id.toString();
    }

    const { teams, total } = await this._teamRepo.getTeamsWithPagination(companyId, query.page, query.limit, query.search);
    return {
      teams: TeamMapper.toResponseList(teams),
      total,
    };
  }
}
