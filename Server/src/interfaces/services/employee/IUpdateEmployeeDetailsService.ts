import { UpdateEmployeeRequestDTO, EmployeeResponseDTO } from '../../../dto/employee.dto';

export interface IUpdateEmployeeDetailsService {
  execute(userId: string, data: UpdateEmployeeRequestDTO): Promise<EmployeeResponseDTO>;
}
