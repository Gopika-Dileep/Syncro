import { ChangePasswordRequestDTO } from '../../../dto/user.dto';

export interface IChangePasswordService {
  execute(userId: string, data: ChangePasswordRequestDTO): Promise<{ message: string }>;
}
