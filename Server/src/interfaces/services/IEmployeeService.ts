import {
  EmployeeResponseDTO,
  PaginatedEmployeeResponseDTO,
  AddEmployeeRequestDTO,
  GetEmployeesRequestDTO,
  UpdateEmployeeRequestDTO,
} from '../../dto/employee.dto';

export interface IEmployeeService {
  addEmployee(companyId: string, data: AddEmployeeRequestDTO): Promise<void>;
  getEmployees(companyId: string, query: GetEmployeesRequestDTO): Promise<PaginatedEmployeeResponseDTO>;
  toggleBlockEmployee(companyId: string, userId: string): Promise<boolean>;
  getEmployeeDetails(userId: string): Promise<EmployeeResponseDTO>;
  updateEmployeeDetails(userId: string, data: UpdateEmployeeRequestDTO): Promise<EmployeeResponseDTO>;
}
