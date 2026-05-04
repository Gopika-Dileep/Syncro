import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IUpdateSubTaskService } from '../../interfaces/services/subTask/IUpdateSubTaskService';
import { UpdateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';

@injectable()
export class UpdateSubTaskService implements IUpdateSubTaskService {
  constructor(@inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository) {}

  async execute(subTaskId: string, data: UpdateSubTaskRequestDTO): Promise<SubTaskResponseDTO> {
    const subTask = await this._subTaskRepository.updateById(subTaskId, data);
    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
