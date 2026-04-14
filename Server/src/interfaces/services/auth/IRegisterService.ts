import { RegisterRequestDTO } from '../../../dto/auth.dto';

export interface IRegisterService {
  execute(data: RegisterRequestDTO): Promise<{ message: string }>;
}
