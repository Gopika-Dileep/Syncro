import { injectable, inject } from 'inversify';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IDeleteProjectService } from '../../interfaces/services/project/IDeleteProjectService';
import { TYPES } from '../../di/types';
import { PROJECT_MESSAGES } from '../../constants/messages';

@injectable()
export class DeleteProjectService implements IDeleteProjectService {
  constructor(
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string): Promise<void> {
    const result = await this._projectRepository.deleteById(projectId);
    if (!result) throw new Error(PROJECT_MESSAGES.NOT_FOUND);
    return;
  }
}
