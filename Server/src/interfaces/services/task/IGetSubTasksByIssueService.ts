import { SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IGetSubTasksByIssueService {
  execute(userId: string, issueId: string): Promise<SubTaskResponseDTO[]>;
}
