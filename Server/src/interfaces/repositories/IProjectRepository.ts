import { IProject } from '../../models/project.model';
import { IBaseRepository } from './IBaseRepository';

export interface IProjectRepository extends IBaseRepository<IProject> {
  findAllByCompanyId(companyId: string): Promise<IProject[]>;
  getProjectsWithPagination(
    companyId: string,
    page: number,
    limit: number,
    search: string,
    status?: string,
  ): Promise<{ projects: IProject[]; total: number }>;
}
