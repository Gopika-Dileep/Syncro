import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { companyModel, ICompany } from "../models/company.model";


export class CompanyRepository implements ICompanyRepository{
    async findCompanyByUserId(userId: string): Promise<ICompany | null> {
        return companyModel.findOne({ user_id: userId })
    }
    

    async createCompany(userId:string,companyName:string):Promise<ICompany>{
        return companyModel.create({user_id:userId, name: companyName})
    }
}