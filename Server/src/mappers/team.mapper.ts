import { TeamResponseDTO } from '../dto/team.dto';
import { ITeam } from '../models/team.model';

export class TeamMapper {
  static toResponseDTO(team: ITeam): TeamResponseDTO {
    return {
      _id: team._id.toString(),
      name: team.name,
      company_id: team.company_id.toString(),
      created_at: (team as any).createdAt ? new Date((team as any).createdAt).toISOString() : undefined,
    };
  }

  static toResponseList(teams: ITeam[]): TeamResponseDTO[] {
    return teams.map((team) => this.toResponseDTO(team));
  }
}
