import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetSubTasksByIssueService {
  execute(issueId: string): Promise<SubTaskResponseDTO[]>;
}
