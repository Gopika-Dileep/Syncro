import { IIssue } from '../../../models/issue.model';

export interface IAddAttachmentToIssueService {
  execute(issueId: string, userId: string, attachments: { file_url: string; file_name: string }[]): Promise<IIssue>;
}
