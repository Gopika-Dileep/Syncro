import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { companyModel, ICompany } from "../models/company.model";
import { IUser, userModel } from "../models/user.model";
import { IEmployee, employeeModel } from "../models/employee.model"

export class EmployeeRepository implements IEmployeeRepository {
    async findCompanyByUserId(userId: string): Promise<ICompany | null> {
        return companyModel.findOne({ user_id: userId })
    }

    async createUser(name: string, email: string, hashedpassword: string): Promise<IUser> {
        return userModel.create({ name, email, password: hashedpassword, role: "employee" })
    }

    async createEmployee(userId: string, companyId: string, data: Partial<IEmployee>): Promise<IEmployee> {
        return employeeModel.create({ user_id: userId, company_id: companyId, ...data })
    }
}