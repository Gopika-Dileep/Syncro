import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IssueStatus } from '../../enums/IssueEnums';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IAssignIssueService } from '../../interfaces/services/issue/IAssignIssueService';
import { AssignIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AssignIssueService implements IAssignIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(data: AssignIssueRequestDTO, userId: string): Promise<IssueResponseDTO> {
    const assigner = await this._employeeRepository.findOne({ user_id: userId });
    if (!assigner) throw new Error('Assigner not found');

    const issueToUpdate = await this._issueRepository.findById(data.issue_id);
    if (!issueToUpdate) throw new Error('Issue not found');

    const updateData: Record<string, unknown> = {
      assigned_by: assigner._id,
    };

    if (data.sprint_id) {
      updateData.sprint_id = data.sprint_id;
      updateData.status = IssueStatus.TODO;
    }

    if (issueToUpdate.type !== 'story' && data.assignee_id) {
      updateData.assignee_id = data.assignee_id;
    }

    const updatedIssue = await this._issueRepository.updateById(data.issue_id, updateData);

    if (!updatedIssue) throw new Error('Failed to update issue');
    return IssueMapper.toResponseDTO(updatedIssue);
  }
}
