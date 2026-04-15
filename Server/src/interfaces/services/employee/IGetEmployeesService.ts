import { GetEmployeesRequestDTO, PaginatedEmployeeResponseDTO } from '../../../dto/employee.dto';

export interface IGetEmployeesService {
  execute(userId: string, query: GetEmployeesRequestDTO): Promise<PaginatedEmployeeResponseDTO>;
}
