import { AuthController } from "../controller/auth.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { EmployeeRepository } from "../repositories/employee.repository";
import { PermissionRepository } from "../repositories/permission.repository";
import { AuthService } from "../service/auth.service";

const authRepo = new AuthRepository();
const companyRepo = new CompanyRepository()
const employeeRepo = new EmployeeRepository()
const permissionRepo = new PermissionRepository()
const authService = new AuthService(authRepo, companyRepo,permissionRepo,employeeRepo);
const authController = new AuthController(authService);

export {
    authController
}