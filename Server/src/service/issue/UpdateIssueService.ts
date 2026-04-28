import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IUpdateIssueService } from '../../interfaces/services/issue/IUpdateIssueService';
import { UpdateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';

@injectable()
export class UpdateIssueService implements IUpdateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository
  ) {}

  async execute(issueId: string, data: UpdateIssueRequestDTO, userId: string): Promise<IssueResponseDTO> {
    const issue = await this._issueRepository.update(issueId, data);
    if (!issue) throw new Error('Issue not found');
    return IssueMapper.toResponseDTO(issue);
  }
}
