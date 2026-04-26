import { injectable, inject } from 'inversify';
import { IGetAllTasksService } from '../../interfaces/services/task/IGetAllTasksService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';
import { IssueType } from '../../enums/UserStoryEnums';

@injectable()
export class GetAllTasksService implements IGetAllTasksService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(userId: string): Promise<TaskResponseDTO[]> {
    const employee = await this._employeeRepository.findByUserId(userId);
    if (!employee) return [];

    const companyId = employee.company_id._id.toString();
    
    // 1. Fetch all sub-tasks for the company
    const tasks = await this._taskRepository.findAllByCompanyId(companyId);
    const taskDTOs = tasks.map(task => TaskMapper.toResponseDTO(task));

    // 2. Fetch all standalone Bugs and Tasks for the company
    const issues = await this._userStoryRepository.findPopulated({
      company_id: companyId,
      type: { $in: [IssueType.BUG, IssueType.TASK] }
    });
    const issueDTOs = issues.map(issue => TaskMapper.fromIssue(issue));

    // 3. Combine both for the Kanban board
    return [...taskDTOs, ...issueDTOs];
  }
}
