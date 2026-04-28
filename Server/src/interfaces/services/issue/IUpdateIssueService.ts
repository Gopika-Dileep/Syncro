import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../../dto/issue.dto';

export interface IUpdateIssueService {
  execute(issueId: string, data: UpdateIssueRequestDTO, userId: string): Promise<IssueResponseDTO>;
}
