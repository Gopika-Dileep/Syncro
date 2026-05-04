import { IssueResponseDTO } from '../../../dto/issue.dto';

export interface IGetTeamIssuesService {
  execute(userId: string): Promise<IssueResponseDTO[]>;
}
