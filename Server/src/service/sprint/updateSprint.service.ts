import { injectable, inject } from 'inversify';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IIssueRepository } from '../../interfaces/repositories/IIssueRepository';
import { IUpdateSprintService } from '../../interfaces/services/sprint/IUpdateSprintService';
import { UpdateSprintRequestDTO, SprintResponseDTO } from '../../dto/sprint.dto';
import { SprintMapper } from '../../mappers/sprint.mapper';
import { TYPES } from '../../di/types';
import { SPRINT_MESSAGES } from '../../constants/messages';
import { NotFoundError, BadRequestError } from '../../errors/AppError';
import { SprintStatus } from '../../enums/SprintEnums';
import { IssueStatus } from '../../enums/IssueEnums';

@injectable()
export class UpdateSprintService implements IUpdateSprintService {
  constructor(
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.IIssueRepository) private _issueRepository: IIssueRepository,
  ) {}

  async execute(sprintId: string, data: UpdateSprintRequestDTO): Promise<{ message: string; sprint: SprintResponseDTO }> {
    // 1. Guard: Check if attempting to complete the sprint
    if (data.status === SprintStatus.COMPLETED) {
      const incompleteIssues = await this._issueRepository.find({
        sprint_id: sprintId,
        status: { $ne: IssueStatus.DONE }
      });

      if (incompleteIssues.length > 0) {
        throw new BadRequestError(`Cannot complete sprint: ${incompleteIssues.length} items are still incomplete. All issues must be 'Done' before finishing the sprint.`);
      }
    }

    // 2. Perform update
    const sprint = await this._sprintRepository.updateById(sprintId, data);
    if (!sprint) throw new NotFoundError(SPRINT_MESSAGES.NOT_FOUND);

    return {
      message: SPRINT_MESSAGES.UPDATE_SUCCESS,
      sprint: SprintMapper.toResponseDTO(sprint),
    };
  }
}
