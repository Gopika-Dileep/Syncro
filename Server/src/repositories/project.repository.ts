import { injectable } from 'inversify';
import { IProjectRepository } from '../interfaces/repositories/IProjectRepository';
import { IProject, projectModel } from '../models/project.model';
import { BaseRepository } from './base.repository';

@injectable()
export class ProjectRepository extends BaseRepository<IProject> implements IProjectRepository {
  constructor() {
    super(projectModel);
  }

  async findAllByCompanyId(companyId: string): Promise<IProject[]> {
    return await this._model.find({ company_id: companyId }).sort({ created_at: -1 }).exec();
  }
}
