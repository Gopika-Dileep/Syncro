import { EmployeeController } from "../controller/employee/employee.controller";
import { AuthRepository } from "../repositories/auth.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { EmployeeRepository } from "../repositories/employee.respository";
import { EmployeeService } from "../service/employee.service";


const employeeRepo = new EmployeeRepository()
const authRepo = new AuthRepository();
const companyRepo = new CompanyRepository()
const employeeService = new EmployeeService(employeeRepo, authRepo,companyRepo)
const employeeController = new EmployeeController(employeeService)

export {
    employeeController
}