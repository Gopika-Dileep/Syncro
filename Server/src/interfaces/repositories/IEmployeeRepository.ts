import { ICompany } from "../../models/company.model";
import { IEmployee } from "../../models/employee.model";
import { IUser } from "../../models/user.model";



export interface IEmployeeRepository {
    findCompanyByUserId(userId:string):Promise<ICompany|null>
    findUserByEmail(email:string):Promise<IUser|null>
    createUser(name:string,email:string,hashedpassword:String):Promise<IUser>
    createEmployee(userId:string,companyId:string, data:Partial <IEmployee>):Promise<IEmployee>
    getEmployeesByCompanyId(companyId:string):Promise<IEmployee[]>
    toggleBlockUser(userId:string):Promise<boolean>
}