import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IReviewSubTaskService } from '../../interfaces/services/subTask/IReviewSubTaskService';
import { ReviewSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';

@injectable()
export class ReviewSubTaskService implements IReviewSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository
  ) {}

  async execute(subTaskId: string, data: ReviewSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const status = data.action === 'approve' ? SubTaskStatus.DONE : SubTaskStatus.IN_PROGRESS;
    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      status,
      rework_reason: data.rework_reason,
    });
    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
