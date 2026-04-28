import { IssueResponseDTO } from '../../../dto/issue.dto';

export interface IGetIssuesBySprintService {
  execute(sprintId: string): Promise<IssueResponseDTO[]>;
}
