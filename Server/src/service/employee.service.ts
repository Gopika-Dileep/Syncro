import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { AddEmployeeData, IEmployeeService } from "../interfaces/services/IEmployeeService";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendEmployeeInvitationEmail } from "../utils/email.utils"
import { parseDate } from "../utils/parseDate.utils";
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";

export class EmployeeService implements IEmployeeService {
    constructor(
        private _employeeRepo: IEmployeeRepository,
        private _authRepo: IAuthRepository,
        private _companyRepo: ICompanyRepository
    ) { }

    async addEmployee(companyId: string, data: AddEmployeeData): Promise<void> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if (!company) {
            throw new Error("company not found")
        }
        
        const existingUser = await this._authRepo.findByEmail(data.email)
        if (existingUser) throw new Error("employee with this email already exists")
        
            const randomPassword = crypto.randomBytes(6).toString("hex")
            console.log("empoyee pass :" , randomPassword)
            const hashedpassword = await bcrypt.hash(randomPassword, 10)
            
            
            const user = await this._authRepo.createUser(data.name, data.email, hashedpassword, 'employee')

            await this._authRepo.verifyUser(user._id.toString())

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
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if(!company) throw new Error("company not found")
        return this._employeeRepo.getEmployeesByCompanyId(company._id.toString())
    }

    async toggleBlockEmployee(companyId: string, userId: string): Promise<boolean> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if(!company) throw new Error("company not found")
        const newStatus = await this._authRepo.toggleBlockUser(userId)
        return newStatus
    }
}