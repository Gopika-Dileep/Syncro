import { injectable, inject } from 'inversify';
import { IGetTeamDirectoryService } from '../../interfaces/services/team/IGetTeamDirectoryService';
import { ITeamRepository } from '../../interfaces/repositories/ITeamRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { GetTeamDirectoryRequestDTO, TeamDirectoryDTO } from '../../dto/team.dto';
import { TeamMapper } from '../../mappers/team.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { EMPLOYEE_MESSAGES } from '../../constants/messages';

@injectable()
export class GetTeamDirectoryService implements IGetTeamDirectoryService {
  constructor(
    @inject(TYPES.ITeamRepository) private _teamRepo: ITeamRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(userId: string, permissions: string[], query: GetTeamDirectoryRequestDTO): Promise<TeamDirectoryDTO[]> {
    const employee = await this._employeeRepo.findByUserId(userId);
    if (!employee) throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);

    const mode: 'own' | 'all' = permissions.includes('team:view:all') ? 'all' : 'own';
    const companyId = employee.company_id._id.toString();
    const search = query.search || '';

    if (mode === 'own') {
      const teamId = employee.team_id?._id?.toString();
      if (!teamId) {
        const unassignedEmployees = await this._employeeRepo.getTeamDirectoryMembers(companyId, null, search);
        return [TeamMapper.toDirectoryDTO('unassigned', 'Unassigned', unassignedEmployees)];
      }

      const teamEmployees = await this._employeeRepo.getTeamDirectoryMembers(companyId, teamId, search);
      return [TeamMapper.toDirectoryDTO(teamId, employee.team_id!.name, teamEmployees)];
    }

    const allTeams = await this._teamRepo.find({ company_id: companyId });
    const allEmployees = await this._employeeRepo.getTeamDirectoryMembers(companyId, null, search);

    const directory: TeamDirectoryDTO[] = allTeams.map((team) => {
      const teamIdStr = team._id.toString();
      const teamMembers = allEmployees.filter((emp) => emp.team_id?._id?.toString() === teamIdStr);
      return TeamMapper.toDirectoryDTO(teamIdStr, team.name, teamMembers);
    });

    const unassignedEmployees = allEmployees.filter((emp) => !emp.team_id);
    if (unassignedEmployees.length > 0) {
      directory.push(TeamMapper.toDirectoryDTO('unassigned', 'Unassigned', unassignedEmployees));
    }

    return directory;
  }
}
