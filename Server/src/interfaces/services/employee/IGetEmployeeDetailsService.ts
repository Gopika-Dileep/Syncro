import { EmployeeResponseDTO } from '../../../dto/employee.dto';

export interface IGetEmployeeDetailsService {
  execute(userId: string): Promise<EmployeeResponseDTO>;
}
