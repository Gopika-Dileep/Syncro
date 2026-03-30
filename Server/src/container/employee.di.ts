import { EmployeeController } from "../controller/employee.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { EmployeeRepository } from "../repositories/employee.repository";
import { PermissionRepository } from "../repositories/permission.repository";
import { EmployeeService } from "../service/employee.service";


const employeeRepo = new EmployeeRepository()
const permissionRepo = new PermissionRepository()
const authRepo = new AuthRepository();
const companyRepo = new CompanyRepository()
const employeeService = new EmployeeService(employeeRepo, authRepo, companyRepo, permissionRepo)
const employeeController = new EmployeeController(employeeService)

export {
    employeeController
}