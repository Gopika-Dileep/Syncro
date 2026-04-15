import { TeamResponseDTO, MemberDTO, TeamDirectoryDTO } from '../dto/team.dto';
import { ITeam } from '../models/team.model';
import { IPopulatedEmployee } from '../models/employee.model';

export class TeamMapper {
  static toResponseDTO(team: ITeam): TeamResponseDTO {
    return {
      _id: team._id.toString(),
      name: team.name,
      company_id: team.company_id.toString(),
      created_at: team.createdAt ? team.createdAt.toISOString() : undefined,
    };
  }

  static toResponseList(teams: ITeam[]): TeamResponseDTO[] {
    return teams.map((team) => this.toResponseDTO(team));
  }
  
  static toMemberDTO(emp: IPopulatedEmployee): MemberDTO {
    return {
      _id: emp._id.toString(),
      name: emp.user_id.name,
      email: emp.user_id.email,
      designation: emp.designation,
    };
  }

  static toDirectoryDTO(teamId: string | 'unassigned', teamName: string, members: IPopulatedEmployee[]): TeamDirectoryDTO {
    return {
      _id: teamId,
      name: teamName,
      members: members.map(emp => this.toMemberDTO(emp)),
    };
  }
}
