import { injectable, inject } from 'inversify';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IDeleteTeamService } from '../../interfaces/services/team/IDeleteTeamService';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { TEAM_MESSAGES } from '../../constants/messages';

@injectable()
export class DeleteTeamService implements IDeleteTeamService {
  constructor(
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(teamId: string): Promise<void> {
    const deleted = await this._teamRepo.deleteById(teamId);
    if (!deleted) throw new NotFoundError(TEAM_MESSAGES.TEAM_NOT_FOUND);

    await this._employeeRepo.updateMany({ team_id: teamId }, { team_id: null });
    return;
  }
}
