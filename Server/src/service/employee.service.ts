import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { AddEmployeeData, EmployeePermissions, IEmployeeService, PermissionScopes} from "../interfaces/services/IEmployeeService";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { Types } from "mongoose";
import { sendEmployeeInvitationEmail } from "../utils/email.utils"
import { parseDate } from "../utils/parseDate.utils";
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { IPermissionRepository } from "../interfaces/repositories/IPermissionRepository";
import { IEmployee } from "../models/employee.model";

export class EmployeeService implements IEmployeeService {
    constructor(
        private _employeeRepo: IEmployeeRepository,
        private _authRepo: IAuthRepository,
        private _companyRepo: ICompanyRepository,
        private _permissionRepo: IPermissionRepository
    ) { }

    async addEmployee(companyId: string, data: AddEmployeeData): Promise<void> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if (!company) {
            throw new Error("company not found")
        }

        const existingUser = await this._authRepo.findByEmail(data.email)
        if (existingUser) throw new Error("employee with this email already exists")

        const randomPassword = crypto.randomBytes(6).toString("hex")
        console.log("empoyee pass :", randomPassword)
        const hashedpassword = await bcrypt.hash(randomPassword, 10)


        const user = await this._authRepo.createUser(data.name, data.email, hashedpassword, 'employee')

        await this._authRepo.verifyUser(user._id.toString())

        const selectedKeys = this._flattenPermissions(data.permissions);

        const definitionIds = await this._permissionRepo.getDefinitionIdsByKeys(selectedKeys);

        await this._permissionRepo.createPermission(user._id.toString(), company._id.toString(), definitionIds);


        const joiningDate = parseDate(data.date_of_joining)
        const birthDate = parseDate(data.date_of_birth)

        
        await this._employeeRepo.createEmployee(user._id.toString(), company._id.toString(), {
            ...(data.designation && { designation: data.designation }),
            ...(data.team_id && { team_id: new Types.ObjectId(data.team_id) as unknown as Types.ObjectId }),
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

    private _flattenPermissions(p: EmployeePermissions): string[] {
        const keys: string[] = []
        Object.entries(p).forEach(([module, moduleData]) => {
            Object.entries(moduleData).forEach(([action, val]) => {
                if (typeof val === 'boolean') {
                    if (val) {
                        keys.push(`${module}:${action}:default`);
                    } 
                }else {
                        const scopes = val as PermissionScopes;
                        if (scopes.own) {
                            keys.push(`${module}:${action}:own`)
                        }
                        if (scopes.team) {
                            keys.push(`${module}:${action}:team`)
                        }
                        if (scopes.all) {
                            keys.push(`${module}:${action}:all`)
                        }
                    }
            })
        })
        return keys
    }

    async getEmployees(companyId: string): Promise<object[]> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if (!company) throw new Error("company not found")
        return this._employeeRepo.getEmployeesByCompanyId(company._id.toString())
    }

    async toggleBlockEmployee(companyId: string, userId: string): Promise<boolean> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if (!company) throw new Error("company not found")
        const newStatus = await this._authRepo.toggleBlockUser(userId)
        return newStatus
    }

    async getEmployeeDetails(userId: string): Promise<Object> {
        const employee = await this._employeeRepo.findByUserId(userId)
        if(!employee){
            throw new Error("employee not found")
        }
        return employee
    }

    async updateEmployeeDetails(userId: string, data: Partial<IEmployee>): Promise<IEmployee | null> {
        const updatedEmployee = await this._employeeRepo.updateEmployee(userId , data);

        if(!updatedEmployee){
            throw new Error("failed to update employee details")
        }

        return updatedEmployee
    }
}