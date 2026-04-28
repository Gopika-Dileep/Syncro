import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IStartSubTaskService } from '../../interfaces/services/subTask/IStartSubTaskService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';

@injectable()
export class StartSubTaskService implements IStartSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository
  ) {}

  async execute(subTaskId: string, userId: string): Promise<SubTaskResponseDTO> {
    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      status: SubTaskStatus.IN_PROGRESS,
    });
    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
