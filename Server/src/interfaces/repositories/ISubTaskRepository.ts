import { IBaseRepository } from './IBaseRepository';
import { ISubTask } from '../../models/subTask.model';

export interface ISubTaskRepository extends IBaseRepository<ISubTask> {
  findAllByIssueId(issueId: string): Promise<ISubTask[]>;
  findAllBySprintId(sprintId: string): Promise<ISubTask[]>;
  findAllByTeamId(teamId: string): Promise<ISubTask[]>;
  findAllByCompanyId(companyId: string): Promise<ISubTask[]>;
  findAllByAssigneeId(assigneeId: string): Promise<ISubTask[]>;
}
