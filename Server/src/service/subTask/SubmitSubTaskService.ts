import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISubmitSubTaskService } from '../../interfaces/services/subTask/ISubmitSubTaskService';
import { SubmitSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { SubTaskStatus } from '../../enums/SubTaskEnums';

@injectable()
export class SubmitSubTaskService implements ISubmitSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(subTaskId: string, data: SubmitSubTaskRequestDTO): Promise<SubTaskResponseDTO> {

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      ...data,
      status: SubTaskStatus.IN_REVIEW,
    });

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
