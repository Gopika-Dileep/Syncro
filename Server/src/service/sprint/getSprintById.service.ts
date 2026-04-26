import { injectable, inject } from 'inversify';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IGetSprintByIdService } from '../../interfaces/services/sprint/IGetSprintByIdService';
import { SprintResponseDTO } from '../../dto/sprint.dto';
import { SprintMapper } from '../../mappers/sprint.mapper';
import { TYPES } from '../../di/types';
import { SPRINT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class GetSprintByIdService implements IGetSprintByIdService {
  constructor(
    @inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository,
    @inject(TYPES.IUserStoryRepository) private _userStoryRepo: IUserStoryRepository,
  ) {}

  async execute(id: string): Promise<{ message: string; data: SprintResponseDTO }> {
    const sprint = await this._sprintRepository.findById(id);

    if (!sprint) {
      throw new NotFoundError(SPRINT_MESSAGES.NOT_FOUND);
    }

    const stories = await this._userStoryRepo.findAllBySprintIds([id]);
    const committedPoints = stories.reduce((sum, s) => sum + (s.story_points || 0), 0);

    return {
      message: SPRINT_MESSAGES.FETCH_SUCCESS,
      data: SprintMapper.toResponseDTO(sprint, committedPoints),
    };
  }
}
