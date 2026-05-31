import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IGetAllSubTasksService } from '../../interfaces/services/subTask/IGetAllSubTasksService';
import { SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { NotFoundError } from '../../errors/AppError';
import { USER_MESSAGES } from '../../constants/messages';

@injectable()
export class GetAllSubTasksService implements IGetAllSubTasksService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepository: ICompanyRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(userId: string, search: string): Promise<SubTaskResponseDTO[]> {
    let companyId: string;
    const employee = await this._employeeRepository.findOne({ user_id: userId });

    if (employee) {
      companyId = employee.company_id.toString();
    } else {
      const company = await this._companyRepository.findOne({ user_id: userId });
      if (!company) throw new NotFoundError(USER_MESSAGES.USER_NOT_FOUND_OR_ADMIN);
      companyId = company._id.toString();
    }

    const subTasks = await this._subTaskRepository.findAllByCompanyId(companyId);

    const issues = await this._issueRepository.findActiveTasksAndBugs(companyId);

    let mappedSubTasks = SubTaskMapper.toResponseList(subTasks);
    let mappedIssues = issues.map((issue) => SubTaskMapper.fromIssue(issue));

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      mappedSubTasks = mappedSubTasks.filter((t) => searchRegex.test(t.title));
      mappedIssues = mappedIssues.filter((t) => searchRegex.test(t.title));
    }

    return [...mappedSubTasks, ...mappedIssues];
  }
}
