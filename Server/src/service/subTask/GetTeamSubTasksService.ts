import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetTeamSubTasksService } from '../../interfaces/services/subTask/IGetTeamSubTasksService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class GetTeamSubTasksService implements IGetTeamSubTasksService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(userId: string): Promise<SubTaskResponseDTO[]> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee || !employee.team_id) throw new Error('Employee or Team not found');

    // Find all employees in the same team
    const teamEmployees = await this._employeeRepository.findAll({ team_id: employee.team_id });
    const employeeIds = teamEmployees.map(emp => emp._id);

    const subTasks = await this._subTaskRepository.findAll({ assignee_id: { $in: employeeIds } });
    return SubTaskMapper.toResponseList(subTasks);
  }
}
