import { ResendOtpRequestDTO } from '../../../dto/auth.dto';

export interface IResendOtpService {
  execute(data: ResendOtpRequestDTO): Promise<{ message: string }>;
}
