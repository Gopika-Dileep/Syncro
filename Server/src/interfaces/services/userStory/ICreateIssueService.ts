import { CreateIssueRequestDTO, IssueResponseDTO } from '../../../dto/issue.dto';

export interface ICreateIssueService {
  execute(data: CreateIssueRequestDTO, userId: string): Promise<IssueResponseDTO>;
}
