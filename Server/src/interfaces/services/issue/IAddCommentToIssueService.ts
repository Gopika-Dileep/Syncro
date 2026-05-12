import { IIssue } from '../../../models/issue.model';

export interface IAddCommentToIssueService {
  execute(issueId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<IIssue>;
}
