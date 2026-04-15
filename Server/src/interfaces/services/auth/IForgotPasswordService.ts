import { ForgotPasswordRequestDTO } from '../../../dto/auth.dto';

export interface IForgotPasswordService {
  execute(data: ForgotPasswordRequestDTO): Promise<{ message: string }>;
}
