import { AddEmployeeRequestDTO } from '../../../dto/employee.dto';

export interface IAddEmployeeService {
  execute(userId: string, data: AddEmployeeRequestDTO): Promise<{ message: string }>;
}
