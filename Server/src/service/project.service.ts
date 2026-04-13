import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import { IProjectService } from '../interfaces/services/IProjectService';
import { IProjectRepository } from '../interfaces/repositories/IProjectRepository';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../interfaces/repositories/IEmployeeRepository';
import { TYPES } from '../di/types';
import { ProjectResponseDTO, CreateProjectRequestDTO, UpdateProjectRequestDTO } from '../dto/project.dto';
import { ProjectMapper } from '../mappers/project.mapper';

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.ProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.CompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.EmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  private async resolveCompanyId(userId: string): Promise<string> {
    // First check if it's a company user
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (company) return company._id.toString();

    // Then check if it's an employee user
    const employee = await this._employeeRepo.findByUserId(userId);
    if (employee) return employee.company_id._id.toString();

    throw new Error('Company context not found');
  }

  async createProject(userId: string, data: CreateProjectRequestDTO): Promise<ProjectResponseDTO> {
    const companyId = await this.resolveCompanyId(userId);
    const project = await this._projectRepository.create({
      ...data,
      company_id: new Types.ObjectId(companyId),
    });
    return ProjectMapper.toResponseDTO(project);
  }

  async getProjects(userId: string): Promise<ProjectResponseDTO[]> {
    const companyId = await this.resolveCompanyId(userId);
    const projects = await this._projectRepository.findAllByCompanyId(companyId);
    return ProjectMapper.toResponseList(projects);
  }

  async getProjectById(projectId: string): Promise<ProjectResponseDTO> {
    const project = await this._projectRepository.findById(projectId);
    if (!project) throw new Error('Project not found');
    return ProjectMapper.toResponseDTO(project);
  }

  async updateProject(projectId: string, data: UpdateProjectRequestDTO): Promise<ProjectResponseDTO> {
    const project = await this._projectRepository.updateById(projectId, data);
    if (!project) throw new Error('Project not found');
    return ProjectMapper.toResponseDTO(project);
  }

  async deleteProject(projectId: string): Promise<void> {
    const result = await this._projectRepository.deleteById(projectId);
    if (!result) throw new Error('Project not found');
  }
}
