import { ICompany } from '../../models/company.model';
import { IBaseRepository } from './IBaseRepository';

export interface ICompanyRepository extends IBaseRepository<ICompany> {}
