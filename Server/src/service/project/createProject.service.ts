import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICreateProjectService } from '../../interfaces/services/project/ICreateProjectService';
import { CreateProjectRequestDTO, ProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';

@injectable()
export class CreateProjectService implements ICreateProjectService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  private async resolveCompanyId(userId: string): Promise<string> {
    const company = await this._companyRepo.findOne({ user_id: userId });
    if (company) return (company._id as any).toString();

    const employee = await this._employeeRepo.findByUserId(userId);
    if (employee) return (employee.company_id._id as any).toString();

    throw new Error('Company context not found');
  }

  async execute(userId: string, data: CreateProjectRequestDTO): Promise<{ message: string; project: ProjectResponseDTO }> {
    const companyId = await this.resolveCompanyId(userId);
    const projectEntity = ProjectMapper.toCreate(data, companyId);
    
    const project = await this._projectRepository.create(projectEntity);
    return { 
        message: PROJECT_MESSAGES.CREATE_SUCCESS, 
        project: ProjectMapper.toResponseDTO(project) 
    };
  }
}
