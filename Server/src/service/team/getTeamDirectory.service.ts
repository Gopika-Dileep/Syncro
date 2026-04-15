import { injectable, inject } from 'inversify';
import { IGetTeamDirectoryService } from '../../interfaces/services/team/IGetTeamDirectoryService';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TeamDirectoryDTO } from '../../dto/team.dto';
import { TeamMapper } from '../../mappers/team.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { EMPLOYEE_MESSAGES } from '../../constants/messages';
import { IPopulatedEmployee, IEmployee } from '../../models/employee.model';
import { Model } from 'mongoose';

interface IEmployeeRepoInternal {
  _model: Model<IEmployee>;
}

@injectable()
export class GetTeamDirectoryService implements IGetTeamDirectoryService {
  constructor(
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(userId: string, permissions: string[]): Promise<TeamDirectoryDTO[]> {
    const employee = await this._employeeRepo.findByUserId(userId);
    if (!employee) throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);

    const mode: 'own' | 'all' = permissions.includes('team:view:all') ? 'all' : 'own';
    const companyId = employee.company_id._id.toString();

    if (mode === 'own') {
      const teamId = employee.team_id?._id?.toString();
      if (!teamId) {
        const unassignedEmployees = (await (this._employeeRepo as unknown as IEmployeeRepoInternal)._model
          .find({
            company_id: companyId,
            team_id: { $exists: false },
          })
          .populate('user_id', 'name email')) as unknown as IPopulatedEmployee[];

        return [TeamMapper.toDirectoryDTO('unassigned', 'Unassigned', unassignedEmployees)];
      }

      const teamEmployees = (await (this._employeeRepo as unknown as IEmployeeRepoInternal)._model
        .find({
          team_id: teamId,
        })
        .populate('user_id', 'name email')) as unknown as IPopulatedEmployee[];

      return [TeamMapper.toDirectoryDTO(teamId, employee.team_id!.name, teamEmployees)];
    }

    const allTeams = await this._teamRepo.find({ company_id: companyId });
    const allEmployees = (await (this._employeeRepo as unknown as IEmployeeRepoInternal)._model
      .find({
        company_id: companyId,
      })
      .populate('user_id', 'name email')) as unknown as IPopulatedEmployee[];

    const directory: TeamDirectoryDTO[] = allTeams.map((team) => {
      const teamMembers = allEmployees.filter((emp) => emp.team_id?._id?.toString() === team._id.toString());
      return TeamMapper.toDirectoryDTO(team._id.toString(), team.name, teamMembers);
    });

    const unassignedEmployees = allEmployees.filter((emp) => !emp.team_id);
    if (unassignedEmployees.length > 0) {
      directory.push(TeamMapper.toDirectoryDTO('unassigned', 'Unassigned', unassignedEmployees));
    }

    return directory;
  }
}
