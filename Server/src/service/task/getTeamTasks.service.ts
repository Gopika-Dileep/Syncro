import { injectable, inject } from 'inversify';
import { IGetTeamTasksService } from '../../interfaces/services/task/IGetTeamTasksService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';
import { IssueType } from '../../enums/UserStoryEnums';

@injectable()
export class GetTeamTasksService implements IGetTeamTasksService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(userId: string): Promise<TaskResponseDTO[]> {
    const employee = await this._employeeRepository.findByUserId(userId);
    if (!employee || !employee.team_id) return [];

    const teamId = employee.team_id._id.toString();

    // 1. Fetch sub-tasks assigned to the team
    const tasks = await this._taskRepository.findAllByTeamId(teamId);
    const taskDTOs = tasks.map(task => TaskMapper.toResponseDTO(task));

    // 2. Fetch standalone Bugs and Tasks assigned to members of this team
    // Note: Since Issues don't have team_id, we fetch by assignee_id 
    // where assignee is in the team.
    const teamMembers = await this._employeeRepository.find({ team_id: teamId });
    const memberIds = teamMembers.map(m => m._id);

    const issues = await this._userStoryRepository.findPopulated({
      assignee_id: { $in: memberIds },
      type: { $in: [IssueType.BUG, IssueType.TASK] }
    });
    const issueDTOs = issues.map(issue => TaskMapper.fromIssue(issue));

    // 3. Combine both
    return [...taskDTOs, ...issueDTOs];
  }
}
