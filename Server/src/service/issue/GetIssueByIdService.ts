import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IGetIssueByIdService } from '../../interfaces/services/issue/IGetIssueByIdService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';

@injectable()
export class GetIssueByIdService implements IGetIssueByIdService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository
  ) {}

  async execute(issueId: string): Promise<IssueResponseDTO> {
    const issue = await this._issueRepository.findById(issueId);
    if (!issue) throw new Error('Issue not found');
    return IssueMapper.toResponseDTO(issue);
  }
}
