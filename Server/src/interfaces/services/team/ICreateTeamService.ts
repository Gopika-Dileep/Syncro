import { TeamResponseDTO } from '../../../dto/team.dto';

export interface ICreateTeamService {
  execute(name: string, userId: string): Promise<TeamResponseDTO>;
}
