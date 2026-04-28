import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetAllSubTasksService } from '../../interfaces/services/subTask/IGetAllSubTasksService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class GetAllSubTasksService implements IGetAllSubTasksService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(userId: string): Promise<SubTaskResponseDTO[]> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) throw new Error('Employee not found');

    const subTasks = await this._subTaskRepository.findAll({ company_id: employee.company_id });
    return SubTaskMapper.toResponseList(subTasks);
  }
}
