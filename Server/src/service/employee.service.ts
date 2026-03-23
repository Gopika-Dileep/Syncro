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

        
        await this._employeeRepo.createEmployee(user._id.toString(), company._id.toString(), {
            ...(data.designation && { designation: data.designation }),
            ...(joiningDate && { date_of_joining: joiningDate }),
            ...(data.phone && { phone: data.phone }),

        })

        await sendEmployeeInvitationEmail(
            data.email,
            data.name,
            company.name,
            randomPassword
        )
    }

    // Server/src/service/employee.service.ts
private _flattenPermissions(p: EmployeePermissions): string[] {
    const keys: string[] = [];

    // MODULE: project
    if (p.project.create) keys.push("project:create");
    if (p.project.view.team) keys.push("project:view:team");
    if (p.project.view.all) keys.push("project:view:all");
    if (p.project.update.team) keys.push("project:update:team");
    if (p.project.update.all) keys.push("project:update:all");
    if (p.project.delete) keys.push("project:delete");

    // MODULE: task
    if (p.task.create) keys.push("task:create");
    if (p.task.view.team) keys.push("task:view:team");
    if (p.task.view.all) keys.push("task:view:all");
    if (p.task.assign.team) keys.push("task:assign:team");
    if (p.task.assign.all) keys.push("task:assign:all");
    if (p.task.update.team) keys.push("task:update:team");
    if (p.task.update.all) keys.push("task:update:all");

    // MODULE: sprint
    if (p.sprint.create) keys.push("sprint:create");
    if (p.sprint.view.all) keys.push("sprint:view:all");
    if (p.sprint.update) keys.push("sprint:update");
    if (p.sprint.start) keys.push("sprint:start");
    if (p.sprint.complete) keys.push("sprint:complete");

    // MODULE: userStory
    if (p.userStory.create) keys.push("userStory:create");
    if (p.userStory.view.all) keys.push("userStory:view:all");
    if (p.userStory.update) keys.push("userStory:update");
    if (p.userStory.assign) keys.push("userStory:assign");

    // MODULE: team
    if (p.team.view.team) keys.push("team:view:team");
    if (p.team.view.all) keys.push("team:view:all");
    if (p.team.performance.team) keys.push("team:performance:team");
    if (p.team.performance.all) keys.push("team:performance:all");

    return keys;
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