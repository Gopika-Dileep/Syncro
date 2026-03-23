import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { IEmployee, IPopulatedEmployee, employeeModel } from "../models/employee.model"

export class EmployeeRepository implements IEmployeeRepository {

    async createEmployee(userId: string, companyId: string, data: Partial<IEmployee>): Promise<IEmployee> {
        return employeeModel.create({ user_id: userId, company_id: companyId, ...data })
    }

    async getEmployeesByCompanyId(companyId: string): Promise<IEmployee[]> {
        return employeeModel.find({ company_id: companyId }).populate("user_id", "name email avatar is_blocked").sort({ createdAt: -1 })
    }

    async findByUserId(userId: string): Promise<IPopulatedEmployee | null> {
        return employeeModel.findOne({ user_id: userId }).populate("user_id","name email role created_at").populate("company_id", "name").lean() as unknown as IPopulatedEmployee
    }

    async updateEmployee(userId:string,data:Partial<IEmployee>):Promise<IEmployee |null>{
        return await employeeModel.findOneAndUpdate({user_id:userId},{$set:data},{new:true})
    }
}