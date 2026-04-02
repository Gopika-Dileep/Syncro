import { ICompany } from '../../models/company.model';

export interface ICompanyRepository {
  createCompany(userId: string, companyName: string): Promise<ICompany>;
  findCompanyByUserId(userId: string): Promise<ICompany | null>;
}
