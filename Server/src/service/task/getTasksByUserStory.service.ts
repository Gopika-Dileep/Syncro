import { injectable, inject } from 'inversify';
import { IGetTasksByUserStoryService } from '../../interfaces/services/task/IGetTasksByUserStoryService';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../../di/types';
import { TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';

@injectable()
export class GetTasksByUserStoryService implements IGetTasksByUserStoryService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(userId: string, userStoryId: string): Promise<TaskResponseDTO[]> {
    const employee = await this._employeeRepository.findByUserId(userId);
    
    // 1. Fetch all tasks for this story
    const tasks = await this._taskRepository.findAllByUserStoryId(userStoryId);

    // 2. Permission check: Who can see all tasks?
    // - Company account owner
    // - Employees with 'Manager', 'PM', or 'Admin' in their designation
    
    let canSeeAll = false;

    if (employee) {
        const designation = employee.designation?.toLowerCase() || '';
        const role = employee.user_id?.role?.toLowerCase() || '';
        
        if (role === 'company' || designation.includes('manager') || designation.includes('pm') || designation.includes('admin')) {
            canSeeAll = true;
        }
    } else {
        // If not an employee, might be the company user directly
        // (Checking for company user is fallback if employee profile doesn't exist)
        canSeeAll = true; 
    }

    if (canSeeAll) {
      return TaskMapper.toResponseList(tasks);
    }

    // 3. Filtering for Leads and Developers
    // If they have a team, they only see tasks belonging to their team.
    // Otherwise, they only see tasks specifically assigned to them.
    if (employee?.team_id) {
        const teamId = employee.team_id._id?.toString() || employee.team_id.toString();
        const filteredTasks = tasks.filter(t => {
            const taskTeamId = t.team_id?._id?.toString() || t.team_id?.toString();
            return taskTeamId === teamId;
        });
        return TaskMapper.toResponseList(filteredTasks);
    }

    // Fallback: only see assigned tasks
    return TaskMapper.toResponseList(tasks.filter(t => t.assign_to?._id?.toString() === employee?._id.toString()));
  }
}
