import { GetTeamsRequestDTO, PaginatedTeamResponseDTO } from '../../../dto/team.dto';

export interface IGetTeamsService {
  execute(userId: string, query: GetTeamsRequestDTO): Promise<PaginatedTeamResponseDTO>;
}
