import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ICreateIssueService } from '../../interfaces/services/issue/ICreateIssueService';
import { CreateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class CreateIssueService implements ICreateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository
  ) {}

  async execute(data: CreateIssueRequestDTO, userId: string): Promise<IssueResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) throw new Error('Employee not found');

    const issue = await this._issueRepository.create({
      ...data,
      company_id: employee.company_id,
      created_by: employee._id,
    } as any);

    return IssueMapper.toResponseDTO(issue);
  }
}
