import { ICompany } from "../../models/company.model";


export interface ICompanyRepository{
    createCompany(userId:string,companyName:String):Promise<ICompany>
    findCompanyByUserId(userId:string):Promise<ICompany|null>
}