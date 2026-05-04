import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IGetTeamIssuesService } from '../../interfaces/services/issue/IGetTeamIssuesService';
import { IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class GetTeamIssuesService implements IGetTeamIssuesService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(userId: string): Promise<IssueResponseDTO[]> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee || !employee.team_id) return [];

    const issues = await this._issueRepository.findPopulated({ team_id: employee.team_id });
    return issues.map((issue) => IssueMapper.toResponseDTO(issue));
  }
}
