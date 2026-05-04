import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IStartSubTaskService } from '../../interfaces/services/subTask/IStartSubTaskService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';

@injectable()
export class StartSubTaskService implements IStartSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(subTaskId: string): Promise<SubTaskResponseDTO> {
    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      status: SubTaskStatus.IN_PROGRESS,
    });

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
