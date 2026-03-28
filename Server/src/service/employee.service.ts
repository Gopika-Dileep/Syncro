import { IEmployeeRepository } from "../interfaces/repositories/IEmployeeRepository";
import { IEmployeeService } from "../interfaces/services/IEmployeeService";
import { AddEmployeeRequest, UpdateEmployeeRequest, EmployeePermissions, EmployeeResponseDTO, PaginatedEmployeeResponseDTO, GetEmployeesRequest } from "../dto/employee.dto";
import bcrypt from "bcrypt"
import crypto from "crypto"
import { sendEmployeeInvitationEmail } from "../utils/email.utils"
import { parseDate } from "../utils/parseDate.utils";
import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { ICompanyRepository } from "../interfaces/repositories/ICompanyRepository";
import { IPermissionRepository } from "../interfaces/repositories/IPermissionRepository";

export class EmployeeService implements IEmployeeService {
    constructor(
        private _employeeRepo: IEmployeeRepository,
        private _authRepo: IAuthRepository,
        private _companyRepo: ICompanyRepository,
        private _permissionRepo: IPermissionRepository
    ) { }

    async addEmployee(companyId: string, data: AddEmployeeRequest): Promise<void> {
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
        const dateOfBirth = parseDate(data.date_of_birth)


        await this._employeeRepo.createEmployee(user._id.toString(), company._id.toString(), {
            ...(data.designation && { designation: data.designation }),
            ...(joiningDate && { date_of_joining: joiningDate }),
            ...(dateOfBirth && { date_of_birth: dateOfBirth }),
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.skills && { skills: data.skills }),
        })

        await sendEmployeeInvitationEmail(
            data.email,
            data.name,
            company.name,
            randomPassword
        )
    }

    private _flattenPermissions(p: Partial<EmployeePermissions>): string[] {
        const keys: string[] = [];

        if (p.project) {
            if (p.project.create) keys.push("project:create");
            if (p.project.view.team) keys.push("project:view:team");
            if (p.project.view.all) keys.push("project:view:all");
            if (p.project.update.team) keys.push("project:update:team");
            if (p.project.update.all) keys.push("project:update:all");
            if (p.project.delete) keys.push("project:delete");
        }

        if (p.task) {
            if (p.task.create) keys.push("task:create");
            if (p.task.view.team) keys.push("task:view:team");
            if (p.task.view.all) keys.push("task:view:all");
            if (p.task.assign.team) keys.push("task:assign:team");
            if (p.task.assign.all) keys.push("task:assign:all");
            if (p.task.update.team) keys.push("task:update:team");
            if (p.task.update.all) keys.push("task:update:all");
        }

        if (p.sprint) {
            if (p.sprint.create) keys.push("sprint:create");
            if (p.sprint.view.all) keys.push("sprint:view:all");
            if (p.sprint.update) keys.push("sprint:update");
            if (p.sprint.start) keys.push("sprint:start");
            if (p.sprint.complete) keys.push("sprint:complete");
        }

        if (p.userStory) {
            if (p.userStory.create) keys.push("userStory:create");
            if (p.userStory.view.all) keys.push("userStory:view:all");
            if (p.userStory.update) keys.push("userStory:update");
            if (p.userStory.assign) keys.push("userStory:assign");
        }

        if (p.team) {
            if (p.team.view.team) keys.push("team:view:team");
            if (p.team.view.all) keys.push("team:view:all");
            if (p.team.performance.team) keys.push("team:performance:team");
            if (p.team.performance.all) keys.push("team:performance:all");
        }

        return keys;
    }

    private _unflattenPermissions(keys: string[]): EmployeePermissions {
        const p: EmployeePermissions = {
            project: { create: false, view: { team: false, all: false }, update: { team: false, all: false }, delete: false },
            task: { create: false, view: { team: false, all: false }, assign: { team: false, all: false }, update: { team: false, all: false } },
            sprint: { create: false, view: { all: false }, update: false, start: false, complete: false },
            userStory: { create: false, view: { all: false }, update: false, assign: false },
            team: { view: { team: false, all: false }, performance: { team: false, all: false } }
        };

        keys.forEach(key => {
            const [moduleName, action, scope] = key.split(':') as [keyof EmployeePermissions, string, string?];

            if (p[moduleName] && action) {
                const module = p[moduleName];
                if (scope) {
                    const actionObj = (module as any)[action];
                    if (actionObj) actionObj[scope] = true;
                } else {
                    (module as any)[action] = true;
                }
            }
        });

        return p;
    }


    async getEmployees(companyId: string, query: GetEmployeesRequest): Promise<PaginatedEmployeeResponseDTO> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if (!company) throw new Error("company not found")
        const result = await this._employeeRepo.getEmployeesByCompanyId(company._id.toString(), query.page, query.limit, query.search)

        // Ensure result matches PaginatedEmployeeResponseDTO
        return {
            employees: result.employees as unknown as EmployeeResponseDTO[],
            total: result.total
        };
    }

    async toggleBlockEmployee(companyId: string, userId: string): Promise<boolean> {
        const company = await this._companyRepo.findCompanyByUserId(companyId)
        if (!company) throw new Error("company not found")
        const newStatus = await this._authRepo.toggleBlockUser(userId)
        return newStatus
    }

    async getEmployeeDetails(userId: string): Promise<EmployeeResponseDTO> {
        const employee = await this._employeeRepo.findByUserId(userId)
        if (!employee) {
            throw new Error("employee not found")
        }
        const keys = await this._permissionRepo.getPermissionKeysByUserId(userId);
        const permissions = this._unflattenPermissions(keys);

        return { ...employee as unknown as EmployeeResponseDTO, permissions };
    }

    async updateEmployeeDetails(userId: string, data: UpdateEmployeeRequest): Promise<EmployeeResponseDTO> {
        if (data.name) {
            await this._authRepo.updateUser(userId, { name: data.name });
        }

        if (data.permissions) {
            const selectedKeys = this._flattenPermissions(data.permissions);
            const definitionIds = await this._permissionRepo.getDefinitionIdsByKeys(selectedKeys);
            await this._permissionRepo.updatePermission(userId, definitionIds);
        }

        const updatedEmployee = await this._employeeRepo.updateEmployee(userId, {
            ...(data.designation && { designation: data.designation }),
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.skills && { skills: data.skills }),
            ...(data.date_of_joining && { date_of_joining: parseDate(data.date_of_joining) }),
            ...(data.date_of_birth && { date_of_birth: parseDate(data.date_of_birth) }),
        });

        if (!updatedEmployee) {
            throw new Error("failed to update employee details")
        }
        return this.getEmployeeDetails(userId);
    }
}