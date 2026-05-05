import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IUpdateSubTaskService } from '../../interfaces/services/subTask/IUpdateSubTaskService';
import { UpdateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class UpdateSubTaskService implements IUpdateSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, data: UpdateSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const oldSubTask = await this._subTaskRepository.findById(subTaskId);
    if (!oldSubTask) throw new Error('Sub-task not found');

    const historyEntry: any = {
      user: employee?._id,
      created_at: new Date(),
    };

    if (data.status && data.status !== oldSubTask.status) {
      historyEntry.action = 'status_change';
      historyEntry.from = oldSubTask.status;
      historyEntry.to = data.status;
    } else {
      historyEntry.action = 'updated';
    }

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      ...data,
      $push: { history: historyEntry }
    } as any);
    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
