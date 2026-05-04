import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IGetAssignedIssuesService } from '../../interfaces/services/issue/IGetAssignedIssuesService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class GetAssignedIssuesService implements IGetAssignedIssuesService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(userId: string): Promise<IssueResponseDTO[]> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) throw new Error('Employee not found');

    const issues = await this._issueRepository.findPopulated({ assignee_id: employee._id });
    return issues.map((issue) => IssueMapper.toResponseDTO(issue));
  }
}
