import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { ICreateIssueService } from '../../interfaces/services/issue/ICreateIssueService';
import { CreateIssueRequestDTO, IssueResponseDTO } from '../../dto/issue.dto';
import { IssueMapper } from '../../mappers/issue.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IIssue } from '../../models/issue.model';
import { BadRequestError } from '../../errors/AppError';

@injectable()
export class CreateIssueService implements ICreateIssueService {
  constructor(
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
  ) {}

  async execute(data: CreateIssueRequestDTO, userId: string): Promise<IssueResponseDTO> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) throw new Error('Employee not found');

    if (data.sprint_id) {
      await this.validateSprintPointsLimit(String(data.sprint_id), data.story_points || 0);
    }

    const issue = await this._issueRepository.create({
      ...data,
      company_id: employee.company_id,
      created_by: employee._id,
    } as unknown as IIssue);

    return IssueMapper.toResponseDTO(issue);
  }

  private async validateSprintPointsLimit(sprintId: string, issuePoints: number): Promise<void> {
    const sprint = await this._sprintRepository.findById(sprintId);
    if (!sprint) return;

    const sprintIssues = await this._issueRepository.find({ sprint_id: sprintId });
    const currentPoints = sprintIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0);

    if (currentPoints + issuePoints > sprint.total_points) {
      throw new BadRequestError(`Cannot assign user story. Adding this issue of ${issuePoints} story points would exceed the sprint's remaining points limit. Sprint Limit: ${sprint.total_points} points, Currently assigned: ${currentPoints} points.`);
    }
  }
}
