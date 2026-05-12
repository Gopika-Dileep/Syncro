import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICreateProjectService } from '../../interfaces/services/project/ICreateProjectService';
import { CreateProjectRequestDTO, ProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class CreateProjectService implements ICreateProjectService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(userId: string, data: CreateProjectRequestDTO): Promise<{ message: string; project: ProjectResponseDTO }> {
    const employee = await this._employeeRepo.findByUserId(userId);

    if (!employee || !employee.company_id) {
      throw new NotFoundError(PROJECT_MESSAGES.COMPANY_CONTEXT_NOT_FOUND);
    }

    const companyId = employee.company_id._id ? String(employee.company_id._id) : String(employee.company_id);
    const creatorId = String(employee._id);

    const projectData = ProjectMapper.toCreate(data, companyId, creatorId);

    const project = await this._projectRepository.create(projectData);
    return {
      message: PROJECT_MESSAGES.CREATE_SUCCESS,
      project: ProjectMapper.toResponseDTO(project),
    };
  }
}
