import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ICreateSubTaskService } from '../../interfaces/services/subTask/ICreateSubTaskService';
import { CreateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class CreateSubTaskService implements ICreateSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(data: CreateSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const creator = await this._employeeRepository.findOne({ user_id: userId });
    if (!creator) throw new Error('Employee not found');

    const subTask = await this._subTaskRepository.create({
      ...data,
      company_id: creator.company_id,
      created_by: creator._id,
    } as any);

    return SubTaskMapper.toResponseDTO(subTask);
  }
}
