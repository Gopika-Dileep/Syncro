import { injectable, inject } from 'inversify';
import { IGetAssignedTasksService } from '../../interfaces/services/task/IGetAssignedTasksService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';
import { IssueType } from '../../enums/UserStoryEnums';

@injectable()
export class GetAssignedTasksService implements IGetAssignedTasksService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(userId: string): Promise<TaskResponseDTO[]> {
    const employee = await this._employeeRepository.findByUserId(userId);
    
    if (!employee) return [];

    // 1. Fetch sub-tasks from the Task collection
    const tasks = await this._taskRepository.find({ assign_to: employee._id });
    // Manually populate since find doesn't do it
    for (const task of tasks) {
      await task.populate({ path: 'assign_to', populate: { path: 'user_id' } });
      await task.populate({ path: 'created_by', populate: { path: 'user_id' } });
      await task.populate({ path: 'assigned_by', populate: { path: 'user_id' } });
    }
    const taskDTOs = tasks.map(task => TaskMapper.toResponseDTO(task));

    // 2. Fetch standalone Bugs and Tasks from the UserStory (Issue) collection
    const issues = await this._userStoryRepository.findPopulated({ 
      assignee_id: employee._id,
      type: { $in: [IssueType.BUG, IssueType.TASK] }
    });
    const issueDTOs = issues.map(issue => TaskMapper.fromIssue(issue));

    // 3. Combine both for the Kanban board
    return [...taskDTOs, ...issueDTOs];
  }
}
