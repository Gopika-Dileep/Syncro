import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IGetProjectsService } from '../../interfaces/services/project/IGetProjectsService';
import { GetProjectsRequestDTO, PaginatedProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class GetProjectsService implements IGetProjectsService {
  constructor(
    @inject(TYPES.ProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  private async resolveCompanyId(userId: string): Promise<string> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (company) return (company._id as any).toString();

    const employee = await this._employeeRepo.findByUserId(userId);
    if (employee) return (employee.company_id._id as any).toString();

    throw new Error('Company context not found');
  }

  async execute(userId: string, query: GetProjectsRequestDTO): Promise<PaginatedProjectResponseDTO> {
    const companyId = await this.resolveCompanyId(userId);
    const { projects, total } = await this._projectRepository.getProjectsWithPagination(
      companyId,
      query.page,
      query.limit,
      query.search,
      query.status
    );

    return {
      projects: ProjectMapper.toResponseList(projects),
      total,
    };
  }
}
