import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetSubTaskByIdService } from '../../interfaces/services/subTask/IGetSubTaskByIdService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';

@injectable()
export class GetSubTaskByIdService implements IGetSubTaskByIdService {
  constructor(@inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository) {}

  async execute(subTaskId: string): Promise<SubTaskResponseDTO> {
    const subTask = await this._subTaskRepository.findById(subTaskId);
    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
