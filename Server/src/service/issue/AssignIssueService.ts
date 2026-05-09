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

    interface HistoryEntry {
      action: string;
      from: string;
      to: string;
      user: unknown;
      created_at: Date;
    }
    const historyEntries: HistoryEntry[] = [];
    const now = new Date();

    if (data.assignee_id && String(data.assignee_id) !== String(issueToUpdate.assignee_id)) {
      const assignee = await this._employeeRepository.findById(data.assignee_id);
      if (assignee) await assignee.populate('user_id');

      const oldAssignee = issueToUpdate.assignee_id ? await this._employeeRepository.findById(String(issueToUpdate.assignee_id)) : null;
      if (oldAssignee) await oldAssignee.populate('user_id');

      historyEntries.push({
        action: 'assignee_change',
        from: (oldAssignee as unknown as { user_id?: { name: string } })?.user_id?.name || 'Unassigned',
        to: (assignee as unknown as { user_id?: { name: string } })?.user_id?.name || 'Unknown',
        user: assigner._id,
        created_at: now,
      });
    }

    if (data.sprint_id && String(data.sprint_id) !== String(issueToUpdate.sprint_id)) {
      // In a real app we'd fetch sprint names here too
      historyEntries.push({
        action: 'sprint_change',
        from: issueToUpdate.sprint_id ? 'Previous Sprint' : 'Backlog',
        to: 'New Sprint',
        user: assigner._id,
        created_at: now,
      });
    }

    const updatedIssue = await this._issueRepository.updateById(data.issue_id, {
      ...updateData,
      $push: { history: { $each: historyEntries } },
    });

    if (!updatedIssue) throw new Error('Failed to update issue');
    return IssueMapper.toResponseDTO(updatedIssue);
  }
}
