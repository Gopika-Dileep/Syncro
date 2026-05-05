import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IStartSubTaskService } from '../../interfaces/services/subTask/IStartSubTaskService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class StartSubTaskService implements IStartSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const historyEntry = {
      action: 'status_change',
      from: 'To Do',
      to: SubTaskStatus.IN_PROGRESS,
      user: employee?._id,
      created_at: new Date(),
    };

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      status: SubTaskStatus.IN_PROGRESS,
      $push: { history: historyEntry }
    } as any);

    if (subTask) {
      return SubTaskMapper.toResponseDTO(subTask);
    }

    const issue = await this._issueRepository.updateById(subTaskId, {
      status: 'In Progress',
    });

    if (issue) {
      return SubTaskMapper.fromIssue(issue);
    }

    throw new Error('Task not found');
  }
}
