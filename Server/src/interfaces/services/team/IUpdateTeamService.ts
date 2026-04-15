import { TeamResponseDTO } from '../../../dto/team.dto';

export interface IUpdateTeamService {
  execute(teamId: string, name: string): Promise<TeamResponseDTO>;
}
