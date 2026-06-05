import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICreateProjectService } from '../../interfaces/services/project/ICreateProjectService';
import { CreateProjectRequestDTO, ProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { NotificationType } from '../../enums/NotificationEnums';

@injectable()
export class CreateProjectService implements ICreateProjectService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
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

    try {
      const company = await this._companyRepo.findById(companyId);
      if (company) {
        await this._notificationService.createNotification({
          recipientId: company.user_id.toString(),
          senderId: creatorId,
          type: NotificationType.PROJECT_CREATED,
          title: 'New Project Created',
          message: `${employee.user_id?.name || 'Someone'} created a new project: ${project.name}`,
          link: `/company/projects`,
        });
      }
    } catch (err) {
      console.error('Failed to send project creation notification to admin', err);
    }

    return {
      message: PROJECT_MESSAGES.CREATE_SUCCESS,
      project: ProjectMapper.toResponseDTO(project),
    };
  }
}
