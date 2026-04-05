import { injectable } from 'inversify';
import { ICompanyRepository } from '../interfaces/repositories/ICompanyRepository';
import { companyModel, ICompany } from '../models/company.model';
import { BaseRepository } from './base.repository';

@injectable()
export class CompanyRepository extends BaseRepository<ICompany> implements ICompanyRepository {
  constructor() {
    super(companyModel);
  }
}
