import { TeamDirectoryDTO } from '../../../dto/team.dto';

export interface IGetTeamDirectoryService {
  execute(userId: string, permissions: string[]): Promise<TeamDirectoryDTO[]>;
}
