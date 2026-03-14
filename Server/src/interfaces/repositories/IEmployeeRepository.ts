import { ICompany } from "../../models/company.model";
import { IEmployee } from "../../models/employee.model";




export interface IEmployeeRepository {
    createEmployee(userId:string,companyId:string, data:Partial <IEmployee>):Promise<IEmployee>
    getEmployeesByCompanyId(companyId:string):Promise<IEmployee[]>
}