import { injectable, inject } from 'inversify';
import { ISprintRepository } from '../../interfaces/repositories/ISprintRepository';
import { IDeleteSprintService } from '../../interfaces/services/sprint/IDeleteSprintService';
import { TYPES } from '../../di/types';
import { SPRINT_MESSAGES } from '../../constants/messages';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class DeleteSprintService implements IDeleteSprintService {
  constructor(@inject(TYPES.ISprintRepository) private _sprintRepository: ISprintRepository) {}

  async execute(sprintId: string): Promise<{ message: string }> {
    const sprint = await this._sprintRepository.deleteById(sprintId);
    if (!sprint) throw new NotFoundError(SPRINT_MESSAGES.NOT_FOUND);

    return { message: SPRINT_MESSAGES.DELETE_SUCCESS };
  }
}
