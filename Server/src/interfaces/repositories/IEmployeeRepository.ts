import { IEmployee, IPopulatedEmployee } from "../../models/employee.model";




export interface IEmployeeRepository {
    createEmployee(userId:string,companyId:string, data:Partial <IEmployee>):Promise<IEmployee>
    getEmployeesByCompanyId(companyId:string):Promise<IEmployee[]>
    findByUserId(userId:string):Promise<IPopulatedEmployee | null>
    updateEmployee(userId:string,data:Partial<IEmployee>):Promise<IEmployee |null>
}