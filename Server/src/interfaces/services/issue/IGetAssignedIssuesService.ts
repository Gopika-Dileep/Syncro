import { IssueResponseDTO } from '../../../dto/issue.dto';

export interface IGetAssignedIssuesService {
  execute(userId: string): Promise<IssueResponseDTO[]>;
}
