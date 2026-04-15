import { LoginRequestDTO, AuthResponseDTO } from '../../../dto/auth.dto';

export interface ILoginService {
  execute(data: LoginRequestDTO): Promise<AuthResponseDTO>;
}
