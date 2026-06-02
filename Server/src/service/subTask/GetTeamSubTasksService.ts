import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetTeamSubTasksService } from '../../interfaces/services/subTask/IGetTeamSubTasksService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';

@injectable()
export class GetTeamSubTasksService implements IGetTeamSubTasksService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(userId: string, search: string): Promise<SubTaskResponseDTO[]> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee || !employee.team_id) return [];

    const subTasks = await this._subTaskRepository.findAllByTeamId(employee.team_id.toString());

    const teamEmployees = await this._employeeRepository.find({ team_id: employee.team_id });
    const employeeIds = teamEmployees.map((emp) => emp._id);

    const issues = await this._issueRepository.findActiveTasksAndBugs(employee.company_id.toString(), {
      assigneeIds: employeeIds.map((id) => id.toString()),
    });

    let mappedSubTasks = SubTaskMapper.toResponseList(subTasks);
    let mappedIssues = issues.map((issue) => SubTaskMapper.fromIssue(issue));

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      mappedSubTasks = mappedSubTasks.filter((t) => searchRegex.test(t.title));
      mappedIssues = mappedIssues.filter((t) => searchRegex.test(t.title));
    }

    return [...mappedSubTasks, ...mappedIssues];
  }
}
