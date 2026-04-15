import { injectable, inject } from 'inversify';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IUpdateTeamService } from '../../interfaces/services/team/IUpdateTeamService';
import { TeamResponseDTO } from '../../dto/team.dto';
import { TeamMapper } from '../../mappers/team.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { TEAM_MESSAGES } from '../../constants/messages';

@injectable()
export class UpdateTeamService implements IUpdateTeamService {
  constructor(@inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository) {}

  async execute(teamId: string, name: string): Promise<TeamResponseDTO> {
    const updated = await this._teamRepo.updateById(teamId, { name });
    if (!updated) throw new NotFoundError(TEAM_MESSAGES.TEAM_NOT_FOUND);
    return TeamMapper.toResponseDTO(updated);
  }
}
