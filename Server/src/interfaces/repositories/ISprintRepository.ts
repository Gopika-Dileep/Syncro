import { ISprint } from '../../models/sprint.model';
import { IBaseRepository } from './IBaseRepository';
import { GetSprintsRepositoryDTO } from '../../dto/sprint.dto';

export interface ISprintRepository extends IBaseRepository<ISprint> {
  getSprintsWithPagination(query: GetSprintsRepositoryDTO): Promise<{ sprints: ISprint[]; total: number }>;
}
