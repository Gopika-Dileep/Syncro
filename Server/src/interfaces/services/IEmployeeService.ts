import { AddEmployeeRequest, UpdateEmployeeRequest, EmployeeResponseDTO, PaginatedEmployeeResponseDTO, GetEmployeesRequest } from "../../dto/employee.dto";

export interface IEmployeeService {
    addEmployee(companyId: string, data: AddEmployeeRequest): Promise<void>
    getEmployees(companyId: string, query: GetEmployeesRequest): Promise<PaginatedEmployeeResponseDTO>
    toggleBlockEmployee(companyId: string, userId: string): Promise<boolean>
    getEmployeeDetails(userId: string): Promise<EmployeeResponseDTO>
    updateEmployeeDetails(userId: string, data: UpdateEmployeeRequest): Promise<EmployeeResponseDTO>;
}