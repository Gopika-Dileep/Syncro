import { VerifyOtpRequestDTO, AuthResponseDTO } from '../../../dto/auth.dto';

export interface IVerifyOtpService {
  execute(data: VerifyOtpRequestDTO): Promise<AuthResponseDTO>;
}
