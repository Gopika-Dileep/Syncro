import { IssueResponseDTO } from '../../../dto/issue.dto';

export interface IAutoAssignIssueService {
  execute(issueId: string, userId: string): Promise<IssueResponseDTO>;
}
