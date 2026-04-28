import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IAssignIssueService } from '../../interfaces/services/issue/IAssignIssueService';
import { AssignIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AssignIssueService implements IAssignIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(data: AssignIssueRequestDTO, userId: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const issue = await this._issueRepository.update(data.issue_id, {
      assignee_id: data.assignee_id,
      assigned_by: assigner._id,
    } as any);

    if (!issue) throw new Error('Issue not found');
    return IssueMapper.toResponseDTO(issue);
  }
}
