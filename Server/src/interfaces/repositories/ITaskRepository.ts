import { IBaseRepository } from './IBaseRepository';
import { ITask } from '../../models/task.model';

export interface ITaskRepository extends IBaseRepository<ITask> {
  findAllByUserStoryId(userStoryId: string): Promise<ITask[]>;
  findAllBySprintId(sprintId: string): Promise<ITask[]>;
  findAllByTeamId(teamId: string): Promise<ITask[]>;
  findAllByCompanyId(companyId: string): Promise<ITask[]>;
}

