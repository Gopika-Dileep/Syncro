import { AuthResponseDTO } from '../../../dto/auth.dto';

export interface IRefreshService {
  execute(refreshToken: string): Promise<Omit<AuthResponseDTO, 'refreshToken'>>;
}
