import { IIssue } from '../../../models/issue.model';

export interface IAddCommentToIssueService {
  execute(issueId: string, userId: string, text: string): Promise<IIssue>;
}
