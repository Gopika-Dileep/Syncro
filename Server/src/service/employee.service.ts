import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { AddEmployeeData, IEmployeeService } from "../interfaces/services/IEmployeeService";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendEmployeeInvitationEmail } from "../utils/email.utils"
import { parseDate } from "../utils/parseDate.utils";

export class EmployeeService implements IEmployeeService {
    constructor(private _employeeRepo: IEmployeeRepository) { }

    async addEmployee(companyId: string, data: AddEmployeeData): Promise<void> {
        const company = await this._employeeRepo.findCompanyByUserId(companyId)
        if (!company) {
            throw new Error("company not found")
        }

        const randomPassword = crypto.randomBytes(6).toString("hex")

        const hashedpassword = await bcrypt.hash(randomPassword, 10)

        const existingUser = await this._employeeRepo.findUserByEmail(data.email)
        if (existingUser) throw new Error("employee with this email already exists")

        const user = await this._employeeRepo.createUser(data.name, data.email, hashedpassword)

        const joiningDate = parseDate(data.date_of_joining)
        const birthDate = parseDate(data.date_of_birth)
        await this._employeeRepo.createEmployee(user._id.toString(), company._id.toString(), {
            ...(data.designation && { designation: data.designation }),
            ...(joiningDate && { date_of_joining: joiningDate }),      
            ...(birthDate && { date_of_birth: birthDate }),        
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            skills: data.skills ?? [],
        })

        await sendEmployeeInvitationEmail(
            data.email,
            data.name,
            company.name,
            randomPassword
        )
    }


    async getEmployees(companyId:string):Promise<any[]>{
        const company = await this._employeeRepo.findCompanyByUserId(companyId)
        if(!company) throw new Error("company not found")
        return this._employeeRepo.getEmployeesByCompanyId(company._id.toString())
    }

    async toggleBlockEmployee(companyId: string, userId: string): Promise<boolean> {
        const company = await this._employeeRepo.findCompanyByUserId(companyId)
        if(!company) throw new Error("company not found")
        const newStatus = await this._employeeRepo.toggleBlockUser(userId)
        return newStatus
    }


}