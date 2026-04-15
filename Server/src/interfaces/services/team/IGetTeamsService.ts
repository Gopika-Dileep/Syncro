import { TeamResponseDTO } from '../../../dto/team.dto';

export interface IGetTeamsService {
  execute(userId: string): Promise<TeamResponseDTO[]>;
}
