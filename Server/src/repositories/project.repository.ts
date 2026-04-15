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

  async getProjectsWithPagination(companyId: string, page: number, limit: number, search: string, status?: string): Promise<{ projects: IProject[]; total: number }> {
    const filter: Record<string, unknown> = { company_id: companyId };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const total = await this._model.countDocuments(filter);
    const projects = await this._model
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { projects, total };
  }
}
