import { IBaseRepository } from './IBaseRepository';
import { IIssue } from '../../models/issue.model';

export interface IIssueRepository extends IBaseRepository<IIssue> {
  findAllByProjectId(projectId: string): Promise<IIssue[]>;
  findAllBySprintIds(sprintIds: string[]): Promise<IIssue[]>;
  findPopulated(filter: Record<string, unknown>): Promise<IIssue[]>;
}
