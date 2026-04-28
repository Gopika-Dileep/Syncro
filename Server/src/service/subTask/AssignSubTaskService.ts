import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IAssignSubTaskService } from '../../interfaces/services/subTask/IAssignSubTaskService';
import { AssignSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AssignSubTaskService implements IAssignSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(subTaskId: string, data: AssignSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      assignee_id: data.assignee_id,
      assigned_by: assigner._id,
    } as any);

    if (!subTask) throw new Error('Sub-task not found');
    return SubTaskMapper.toResponseDTO(subTask);
  }
}
