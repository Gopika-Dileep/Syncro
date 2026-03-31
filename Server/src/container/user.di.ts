import { UserController } from "../controller/user.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { EmployeeRepository } from "../repositories/employee.repository";
import { UserService } from "../service/user.service";

const authRepo = new AuthRepository();
const companyRepo = new CompanyRepository();
const employeeRepo = new EmployeeRepository();
const userService = new UserService(authRepo, companyRepo, employeeRepo);
const userController = new UserController(userService);

export {
    userController
}
