import { TeamResponseDTO } from '../../dto/team.dto';

export interface ITeamService {
  createTeam(name: string, userId: string): Promise<TeamResponseDTO>;
  getTeams(userId: string): Promise<TeamResponseDTO[]>;
  updateTeam(teamId: string, name: string): Promise<TeamResponseDTO>;
  deleteTeam(teamId: string): Promise<void>;
}
