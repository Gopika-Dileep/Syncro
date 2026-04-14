import { injectable, inject } from 'inversify';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IUpdateTeamService } from '../../interfaces/services/team/IUpdateTeamService';
import { TeamResponseDTO } from '../../dto/team.dto';
import { TeamMapper } from '../../mappers/team.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class UpdateTeamService implements IUpdateTeamService {
  constructor(
    @inject(TYPES.TeamRepository) private _teamRepo: ITeamRepository,
  ) {}

  async execute(teamId: string, name: string): Promise<TeamResponseDTO> {
    const updated = await this._teamRepo.updateById(teamId, { name });
    if (!updated) throw new Error('team not found or update failed');
    return TeamMapper.toResponseDTO(updated);
  }
}
