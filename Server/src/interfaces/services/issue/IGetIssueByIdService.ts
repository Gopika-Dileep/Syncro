import { IssueResponseDTO } from '../../../dto/issue.dto';

export interface IGetIssueByIdService {
  execute(issueId: string): Promise<IssueResponseDTO>;
}
