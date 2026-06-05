import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICompanyRepository } from '../../interfaces/repositories/ICompanyRepository';
import { INotificationService } from '../../interfaces/services/notification/INotificationService';
import { IUpdateProjectService } from '../../interfaces/services/project/IUpdateProjectService';
import { UpdateProjectRequestDTO, ProjectResponseDTO } from '../../dto/project.dto';
import { ProjectMapper } from '../../mappers/project.mapper';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';
import { NotificationType } from '../../enums/NotificationEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';

@injectable()
export class UpdateProjectService implements IUpdateProjectService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
    @inject(TYPES.ICompanyRepository) private _companyRepo: ICompanyRepository,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
  ) {}

  async execute(projectId: string, data: UpdateProjectRequestDTO, userId?: string): Promise<ProjectResponseDTO> {
    const oldProject = await this._projectRepository.findById(projectId);
    if (!oldProject) throw new NotFoundError(PROJECT_MESSAGES.NOT_FOUND);

    const updateData = ProjectMapper.toUpdate(data);
    const project = await this._projectRepository.updateById(projectId, updateData);
    if (!project) throw new NotFoundError(PROJECT_MESSAGES.NOT_FOUND);

    if (data.status && data.status !== oldProject.status) {
      if (data.status === ProjectStatus.COMPLETED || data.status === ProjectStatus.ON_HOLD) {
        try {
          const companyId = oldProject.company_id.toString();
          const company = await this._companyRepo.findById(companyId);
          if (company) {
            const notifier = userId ? await this._employeeRepo.findByUserId(userId) : null;
            const changerName = notifier?.user_id?.name || 'Someone';

            let title = '';
            let message = '';
            let type: NotificationType;

            if (data.status === ProjectStatus.COMPLETED) {
              title = 'Project Completed';
              message = `${changerName} marked project "${project.name}" as Completed.`;
              type = NotificationType.PROJECT_COMPLETED;
            } else {
              title = 'Project Moved on Hold';
              message = `${changerName} marked project "${project.name}" as On-Hold.`;
              type = NotificationType.PROJECT_HOLD;
            }

            await this._notificationService.createNotification({
              recipientId: company.user_id.toString(),
              senderId: notifier?._id?.toString() || userId,
              type,
              title,
              message,
              link: `/company/projects`,
            });
          }
        } catch (err) {
          console.error('Failed to send project status update notification to admin', err);
        }
      }
    }

    return ProjectMapper.toResponseDTO(project);
  }
}
