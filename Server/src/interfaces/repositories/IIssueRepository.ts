import { IBaseRepository } from './IBaseRepository';
import { IIssue } from '../../models/issue.model';
import { ICreateCommentInput, ICreateAttachmentInput, ICreateHistoryInput } from '../../dto/issue.dto';

export interface IIssueRepository extends IBaseRepository<IIssue> {
  findAllByProjectId(projectId: string): Promise<IIssue[]>;
  findAllBySprintIds(sprintIds: string[]): Promise<IIssue[]>;
  findPopulated(filter: Record<string, unknown>): Promise<IIssue[]>;
  addComment(id: string, comment: ICreateCommentInput): Promise<IIssue | null>;
  addAttachments(id: string, attachments: ICreateAttachmentInput[]): Promise<IIssue | null>;
  updateWithHistory(id: string, update: Record<string, unknown>, history: ICreateHistoryInput | ICreateHistoryInput[]): Promise<IIssue | null>;
  findActiveByAssigneeId(assigneeId: string): Promise<IIssue[]>;
  findActiveTasksAndBugs(companyId: string, filters?: { assigneeId?: string; assigneeIds?: string[] }): Promise<IIssue[]>;
}
