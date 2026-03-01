import { EmployeeController } from "../controller/employee/employee.controller";
import { EmployeeRepository } from "../repositories/employee.respository";
import { EmployeeService } from "../service/employee/employee.service";


const employeeRepo = new EmployeeRepository()
const employeeService = new EmployeeService(employeeRepo)
const employeeController = new EmployeeController(employeeService)

export {
    employeeController
}