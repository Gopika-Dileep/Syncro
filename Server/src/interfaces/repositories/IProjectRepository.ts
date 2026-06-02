import { IProject } from '../../models/project.model';
import { IBaseRepository } from './IBaseRepository';
import { GetProjectsRepositoryDTO } from '../../dto/project.dto';

export interface IProjectRepository extends IBaseRepository<IProject> {
  findAllByCompanyId(companyId: string): Promise<IProject[]>;
  getProjectsWithPagination(query: GetProjectsRepositoryDTO): Promise<{ projects: IProject[]; total: number }>;
}
