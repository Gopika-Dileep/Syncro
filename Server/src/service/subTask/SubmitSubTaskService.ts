import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISubmitSubTaskService } from '../../interfaces/services/subTask/ISubmitSubTaskService';
import { SubmitSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class SubmitSubTaskService implements ISubmitSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, data: SubmitSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const historyEntry = {
      action: 'status_change',
      from: SubTaskStatus.IN_PROGRESS,
      to: SubTaskStatus.IN_REVIEW,
      user: employee?._id,
      created_at: new Date(),
    };

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      ...data,
      status: SubTaskStatus.IN_REVIEW,
      rework_reason: undefined,
      $push: { history: historyEntry }
    } as any);


    if (subTask) {
      return SubTaskMapper.toResponseDTO(subTask);
    }


    const issue = await this._issueRepository.updateById(subTaskId, {
      ...data,
      status: 'In Review',
    });

    if (issue) {
      return SubTaskMapper.fromIssue(issue);
    }

    throw new Error('Task not found');
  }
}
