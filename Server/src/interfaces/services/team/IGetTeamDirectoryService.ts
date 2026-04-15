import { GetTeamDirectoryRequestDTO, TeamDirectoryDTO } from '../../../dto/team.dto';

export interface IGetTeamDirectoryService {
  execute(userId: string, permissions: string[], query: GetTeamDirectoryRequestDTO): Promise<TeamDirectoryDTO[]>;
}
