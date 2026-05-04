import { ReviewSubTaskRequestDTO, SubTaskResponseDTO } from '../../../dto/subTask.dto';

export interface IReviewSubTaskService {
  execute(subTaskId: string, data: ReviewSubTaskRequestDTO): Promise<SubTaskResponseDTO>;
}
