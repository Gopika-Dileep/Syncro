import { injectable, inject } from 'inversify';
import { IProjectService } from '../interfaces/services/IProjectService';
import { IProjectRepository } from '../interfaces/repositories/IProjectRepository';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../di/types';
import { 
    ProjectResponseDTO, 
    PaginatedProjectResponseDTO, 
    CreateProjectRequestDTO, 
    UpdateProjectRequestDTO, 
    GetProjectsRequestDTO 
} from '../dto/project.dto';
import { ProjectMapper } from '../mappers/project.mapper';
import { PROJECT_MESSAGES } from '../constants/messages';

@injectable()
export class ProjectService implements IProjectService {
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

  async createProject(userId: string, data: CreateProjectRequestDTO): Promise<{ message: string; project: ProjectResponseDTO }> {
    const companyId = await this.resolveCompanyId(userId);
    const projectEntity = ProjectMapper.toCreate(data, companyId);
    
    const project = await this._projectRepository.create(projectEntity);
    return { 
        message: PROJECT_MESSAGES.CREATE_SUCCESS, 
        project: ProjectMapper.toResponseDTO(project) 
    };
  }

  async getProjects(userId: string, query: GetProjectsRequestDTO): Promise<PaginatedProjectResponseDTO> {
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

  async getProjectById(projectId: string): Promise<ProjectResponseDTO> {
    const project = await this._projectRepository.findById(projectId);
    if (!project) throw new Error(PROJECT_MESSAGES.NOT_FOUND);
    return ProjectMapper.toResponseDTO(project);
  }

  async updateProject(projectId: string, data: UpdateProjectRequestDTO): Promise<ProjectResponseDTO> {
    const updateEntity = ProjectMapper.toUpdate(data);
    const project = await this._projectRepository.updateById(projectId, updateEntity);
    if (!project) throw new Error(PROJECT_MESSAGES.NOT_FOUND);
    return ProjectMapper.toResponseDTO(project);
  }

  async deleteProject(projectId: string): Promise<void> {
    const result = await this._projectRepository.deleteById(projectId);
    if (!result) throw new Error(PROJECT_MESSAGES.NOT_FOUND);
  }
}
