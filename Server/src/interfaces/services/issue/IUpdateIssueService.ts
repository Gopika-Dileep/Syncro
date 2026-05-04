import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../../dto/issue.dto';

export interface IUpdateIssueService {
  execute(issueId: string, data: UpdateIssueRequestDTO): Promise<IssueResponseDTO>;
}
