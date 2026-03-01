import { IEmployeeRepository } from "../../interfaces/repositories/IEmployeeRepository";
import { AddEmployeeData, IEmployeeService } from "../../interfaces/services/IEmployeeService";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendEmployeeInvitationEmail } from "../../utils/email.utils"

export class EmployeeService implements IEmployeeService {
    constructor(private _employeeRepo: IEmployeeRepository) { }

    async addEmployee(adminUserId: string, data: AddEmployeeData): Promise<void> {
        const company = await this._employeeRepo.findCompanyByUserId(adminUserId)
        if (!company) {
            throw new Error("company not found")
        }

        const randomPassword = crypto.randomBytes(6).toString("hex")

        const hashedpassword = await bcrypt.hash(randomPassword, 10)

        const user = await this._employeeRepo.createUser(data.name, data.email, hashedpassword)

        await this._employeeRepo.createEmployee(user._id.toString(), company._id.toString(), {
            ...(data.designation !== undefined && { designation: data.designation }),
            ...(data.date_of_joining !== undefined && { date_of_joining: new Date(data.date_of_joining) }),
            ...(data.date_of_birth !== undefined && { date_of_birth: new Date(data.date_of_birth) }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.address !== undefined && { address: data.address }),
            skills: data.skills ?? [],
        })

        await sendEmployeeInvitationEmail(
            data.email,
            data.name,
            company.name,
            randomPassword
        )
    }
}