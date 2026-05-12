import { IssueResponseDTO } from '../../../dto/issue.dto';

export interface IGetIssuesByProjectService {
  execute(projectId: string): Promise<IssueResponseDTO[]>;
}
