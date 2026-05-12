import { injectable, inject } from 'inversify';
import { IAddCommentToIssueService } from '../../interfaces/services/issue/IAddCommentToIssueService';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IIssue } from '../../models/issue.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AddCommentToIssueService implements IAddCommentToIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(issueId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<IIssue> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const issue = await this._issueRepository.updateById(issueId, {
      $push: {
        comments: {
          user: employee?._id,
          text,
          attachments,
          created_at: new Date(),
        },
      },
    });

    if (!issue) {
      throw new NotFoundError('Issue not found');
    }

    return (await this._issueRepository.findById(issueId, {
      populate: [
        { path: 'comments.user', populate: { path: 'user_id', select: 'name avatar' } },
        { path: 'attachments.uploaded_by', populate: { path: 'user_id', select: 'name avatar' } },
        { path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] },
        { path: 'created_by', populate: { path: 'user_id' } },
        { path: 'assigned_by', populate: { path: 'user_id' } },
      ],
    })) as IIssue;
  }
}
