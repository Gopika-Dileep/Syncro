import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ISubmitSubTaskService } from '../../interfaces/services/subTask/ISubmitSubTaskService';
import { SubmitSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';

@injectable()
export class SubmitSubTaskService implements ISubmitSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository
  ) {}

  async execute(subTaskId: string, data: SubmitSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      ...data,
      status: SubTaskStatus.IN_REVIEW,
    });
    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
