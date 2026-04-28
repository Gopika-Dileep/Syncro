import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IGetIssuesBySprintService } from '../../interfaces/services/issue/IGetIssuesBySprintService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';

@injectable()
export class GetIssuesBySprintService implements IGetIssuesBySprintService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository
  ) {}

  async execute(sprintId: string): Promise<IssueResponseDTO[]> {
    const issues = await this._issueRepository.findAllBySprintIds([sprintId]);
    return IssueMapper.toResponseList(issues);
  }
}
