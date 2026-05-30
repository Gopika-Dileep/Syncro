import { injectable, inject } from 'inversify';
import { IAddAttachmentToIssueService } from '../../interfaces/services/issue/IAddAttachmentToIssueService';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IIssue } from '../../models/issue.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AddAttachmentToIssueService implements IAddAttachmentToIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(issueId: string, userId: string, attachments: { file_url: string; file_name: string }[]): Promise<IIssue> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const formattedAttachments = attachments.map((att) => ({
      ...att,
      uploaded_by: String(employee._id),
      uploaded_at: new Date(),
    }));

    const updatedIssue = await this._issueRepository.addAttachments(issueId, formattedAttachments);

    if (!updatedIssue) {
      throw new NotFoundError('Issue not found');
    }

    return updatedIssue;
  }
}
