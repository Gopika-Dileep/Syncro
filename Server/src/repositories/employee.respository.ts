import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { companyModel, ICompany } from "../models/company.model";
import { IUser, userModel } from "../models/user.model";
import { IEmployee, employeeModel } from "../models/employee.model"

export class EmployeeRepository implements IEmployeeRepository {
    async findCompanyByUserId(userId: string): Promise<ICompany | null> {
        return companyModel.findOne({ user_id: userId })
    }


    async findUserByEmail(email: string): Promise<IUser | null> {
        return userModel.findOne({email})
    }

    async createUser(name: string, email: string, hashedpassword: string): Promise<IUser> {
        return userModel.create({ name, email, password: hashedpassword, role: "employee" })
    }

    async createEmployee(userId: string, companyId: string, data: Partial<IEmployee>): Promise<IEmployee> {
        return employeeModel.create({ user_id: userId, company_id: companyId, ...data })
    }

    async getEmployeesByCompanyId(companyId: string): Promise<IEmployee[]> {
        return employeeModel.find({company_id:companyId}).populate("user_id","name email avatar is_blocked").sort({createdAt:-1})
    }

    async toggleBlockUser(userId:string):Promise<boolean>{
        const user = await userModel.findById(userId)
        if(!user) throw new Error("user not found")

            const newStatus = !user.is_blocked
            await userModel.findByIdAndUpdate(userId,{is_blocked:newStatus})
            return newStatus
    }
}