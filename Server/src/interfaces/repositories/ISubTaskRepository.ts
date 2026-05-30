import { IBaseRepository } from './IBaseRepository';
import { ISubTask } from '../../models/subTask.model';

import { ICreateCommentInput, ICreateAttachmentInput, ICreateHistoryInput } from './IIssueRepository';

export interface ISubTaskRepository extends IBaseRepository<ISubTask> {
  findAllByIssueId(issueId: string): Promise<ISubTask[]>;
  findAllBySprintId(sprintId: string): Promise<ISubTask[]>;
  findAllByTeamId(teamId: string): Promise<ISubTask[]>;
  findAllByCompanyId(companyId: string): Promise<ISubTask[]>;
  findAllByAssigneeId(assigneeId: string): Promise<ISubTask[]>;
  addComment(id: string, comment: ICreateCommentInput): Promise<ISubTask | null>;
  addAttachments(id: string, attachments: ICreateAttachmentInput[]): Promise<ISubTask | null>;
  updateWithHistory(id: string, update: Record<string, unknown>, history: ICreateHistoryInput | ICreateHistoryInput[]): Promise<ISubTask | null>;
}
