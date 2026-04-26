import { injectable, inject } from 'inversify';
import { IUpdateTaskService } from '../../interfaces/services/task/IUpdateTaskService';
import { ITask } from '../../models/task.model';
import { ITaskRepository } from '../../interfaces/repositories/ITaskRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { TYPES } from '../../di/types';
import { UpdateTaskRequestDTO, TaskResponseDTO } from '../../dto/task.dto';
import { TaskMapper } from '../../mappers/task.mapper';
import { NotFoundError } from '../../errors/AppError';
import { UserStoryStatus } from '../../enums/UserStoryEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';
import { TaskStatus } from '../../enums/TaskEnums';

@injectable()
export class UpdateTaskService implements IUpdateTaskService {
  constructor(
    @inject(TYPES.ITaskRepository) private _taskRepository: ITaskRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(taskId: string, data: UpdateTaskRequestDTO, userId: string): Promise<TaskResponseDTO> {
    const updateData: Record<string, unknown> = { ...data };

    // If assigning, track who is doing it
    let assignerId: string | undefined;
    if (data.assign_to) {
      const assigner = await this._employeeRepository.findByUserId(userId);
      if (assigner) {
        assignerId = assigner._id.toString();
        updateData.assigned_by = assignerId;
      }
    }

    // 1. Try to update in Task collection (sub-tasks)
    let task = await this._taskRepository.updateById(taskId, updateData as Partial<ITask>);
    if (task) {
      // If task moved to Done, check if parent UserStory should also move to Done
      if (data.status === TaskStatus.DONE) {
        const siblingTasks = await this._taskRepository.find({ user_story_id: task.user_story_id });
        const allDone = siblingTasks.every(t => t.status === TaskStatus.DONE);
        if (allDone) {
          const updatedStory = await this._userStoryRepository.updateById(task.user_story_id.toString(), { status: UserStoryStatus.DONE });
          if (updatedStory) {
            const projectStories = await this._userStoryRepository.find({ project_id: updatedStory.project_id });
            const projectAllDone = projectStories.length > 0 && projectStories.every(s => s.status === UserStoryStatus.DONE);
            if (projectAllDone) {
              await this._projectRepository.updateById(updatedStory.project_id.toString(), { status: ProjectStatus.COMPLETED });
            }
          }
        }
      }
      // 2. If parent story moves AWAY from Done because a task was moved away from Done
      else if (data.status) {
        const parentStory = await this._userStoryRepository.findById(task.user_story_id.toString());
        if (parentStory && parentStory.status === UserStoryStatus.DONE) {
          await this._userStoryRepository.updateById(parentStory._id.toString(), { status: UserStoryStatus.IN_PROGRESS });
          await this._projectRepository.updateById(parentStory.project_id.toString(), { status: ProjectStatus.ACTIVE });
        }
      }

      // Re-populate to get full name info after update
      await task.populate({ path: 'assign_to', populate: { path: 'user_id' } });
      await task.populate({ path: 'created_by', populate: { path: 'user_id' } });
      await task.populate({ path: 'assigned_by', populate: { path: 'user_id' } });
      return TaskMapper.toResponseDTO(task);
    }

    // 2. Try to update in UserStory collection (standalone Bugs/Tasks)
    const issueUpdate: Record<string, unknown> = {};
    if (data.status) issueUpdate.status = data.status;
    if (data.priority) issueUpdate.priority = data.priority;
    if (data.title) issueUpdate.title = data.title;
    if (data.description) issueUpdate.description = data.description;
    if (data.assign_to) issueUpdate.assignee_id = data.assign_to;
    if (assignerId) issueUpdate.assigned_by = assignerId;

    const issue = await this._userStoryRepository.updateById(taskId, issueUpdate);
    if (issue) {
      // 1. If issue (Bug/Task) moved to Done, check if all stories in the project are now Done
      if (data.status === TaskStatus.DONE) {
        const projectStories = await this._userStoryRepository.find({ project_id: issue.project_id });
        const allDone = projectStories.length > 0 && projectStories.every(s => s.status === UserStoryStatus.DONE);
        if (allDone) {
          await this._projectRepository.updateById(issue.project_id.toString(), { status: ProjectStatus.COMPLETED });
        }
      }
      // 2. If issue moved AWAY from Done, ensure project is Active
      else if (data.status) {
        await this._projectRepository.updateById(issue.project_id.toString(), { status: ProjectStatus.ACTIVE });
      }

      // Re-populate for response
      await issue.populate({ path: 'assignee_id', populate: { path: 'user_id' } });
      await issue.populate({ path: 'created_by', populate: { path: 'user_id' } });
      await issue.populate({ path: 'assigned_by', populate: { path: 'user_id' } });
      return TaskMapper.fromIssue(issue);
    }

    throw new NotFoundError('Work item not found');
  }
}
