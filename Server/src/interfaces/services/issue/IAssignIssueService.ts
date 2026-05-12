import { AssignIssueRequestDTO, IssueResponseDTO } from '../../../dto/issue.dto';

export interface IAssignIssueService {
  execute(data: AssignIssueRequestDTO, userId: string, permissions: string[], userRole?: string): Promise<IssueResponseDTO>;
}
