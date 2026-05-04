import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IDeleteIssueService } from '../../interfaces/services/issue/IDeleteIssueService';

@injectable()
export class DeleteIssueService implements IDeleteIssueService {
  constructor(@inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository) {}

  async execute(issueId: string): Promise<void> {
    await this._issueRepository.deleteById(issueId);
  }
}
