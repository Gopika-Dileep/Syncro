import { injectable, inject } from 'inversify';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICreateSprintService } from '../../interfaces/services/sprint/ICreateSprintService';
import { CreateSprintRequestDTO, SprintResponseDTO } from '../../dto/sprint.dto';
import { SprintMapper } from '../../mappers/sprint.mapper';
import { TYPES } from '../../di/types';
import { SPRINT_MESSAGES, PROJECT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class CreateSprintService implements ICreateSprintService {
  constructor(
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepo: IEmployeeRepository,
  ) {}

  async execute(userId: string, data: CreateSprintRequestDTO): Promise<{ message: string; sprint: SprintResponseDTO }> {
    const employee = await this._employeeRepo.findByUserId(userId);
    const companyId: string = String(employee?.company_id._id || employee?.company_id);

    if (!companyId) throw new NotFoundError(PROJECT_MESSAGES.COMPANY_CONTEXT_NOT_FOUND);

    const sprintData = SprintMapper.toCreate(data, companyId);

    const sprint = await this._sprintRepository.create(sprintData);
    return {
      message: SPRINT_MESSAGES.CREATE_SUCCESS,
      sprint: SprintMapper.toResponseDTO(sprint),
    };
  }
}
