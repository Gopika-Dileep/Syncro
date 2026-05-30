import { IBaseRepository } from './IBaseRepository';
import { IIssue } from '../../models/issue.model';

export interface ICreateCommentInput {
  user: string;
  text: string;
  attachments?: { file_url: string; file_name: string }[];
}

export interface ICreateAttachmentInput {
  file_url: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: Date;
}

export interface ICreateHistoryInput {
  action: string;
  from?: string;
  to?: string;
  user: string;
}

export interface IIssueRepository extends IBaseRepository<IIssue> {
  findAllByProjectId(projectId: string): Promise<IIssue[]>;
  findAllBySprintIds(sprintIds: string[]): Promise<IIssue[]>;
  findPopulated(filter: Record<string, unknown>): Promise<IIssue[]>;
  addComment(id: string, comment: ICreateCommentInput): Promise<IIssue | null>;
  addAttachments(id: string, attachments: ICreateAttachmentInput[]): Promise<IIssue | null>;
  updateWithHistory(id: string, update: Record<string, unknown>, history: ICreateHistoryInput | ICreateHistoryInput[]): Promise<IIssue | null>;
}
