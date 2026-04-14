import { injectable, inject } from 'inversify';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IDeleteTeamService } from '../../interfaces/services/team/IDeleteTeamService';
import { TYPES } from '../../di/types';

@injectable()
export class DeleteTeamService implements IDeleteTeamService {
  constructor(
    @inject(TYPES.TeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(teamId: string): Promise<void> {
    const deleted = await this._teamRepo.deleteById(teamId);
    if (!deleted) throw new Error('team not found');

    await this._employeeRepo.updateMany({ team_id: teamId }, { team_id: null });
    return;
  }
}
