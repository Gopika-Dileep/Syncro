import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetSubTasksByIssueService } from '../../interfaces/services/subTask/IGetSubTasksByIssueService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';

@injectable()
export class GetSubTasksByIssueService implements IGetSubTasksByIssueService {
  constructor(@inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository) {}

  async execute(issueId: string): Promise<SubTaskResponseDTO[]> {
    const subTasks = await this._subTaskRepository.findAllByIssueId(issueId);
    return SubTaskMapper.toResponseList(subTasks);
  }
}
