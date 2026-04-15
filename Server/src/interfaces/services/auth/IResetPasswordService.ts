import { ResetPasswordRequestDTO } from '../../../dto/auth.dto';

export interface IResetPasswordService {
  execute(data: ResetPasswordRequestDTO): Promise<{ message: string }>;
}
