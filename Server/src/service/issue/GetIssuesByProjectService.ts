import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IGetIssuesByProjectService } from '../../interfaces/services/issue/IGetIssuesByProjectService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';

@injectable()
export class GetIssuesByProjectService implements IGetIssuesByProjectService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository
  ) {}

  async execute(projectId: string): Promise<IssueResponseDTO[]> {
    const issues = await this._issueRepository.findAllByProjectId(projectId);
    return IssueMapper.toResponseList(issues);
  }
}
