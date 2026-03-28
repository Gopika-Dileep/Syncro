import { RegisterRequestDTO, LoginRequestDTO, VerifyOtpRequestDTO, ResendOtpRequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO, AuthResponseDTO } from "../../dto/auth.dto";

export interface IAuthService {
    registration(data: RegisterRequestDTO): Promise<{ message: string }>;
    verifyOtp(data: VerifyOtpRequestDTO): Promise<AuthResponseDTO>;
    resendOtp(data: ResendOtpRequestDTO): Promise<{ message: string }>;
    login(data: LoginRequestDTO): Promise<AuthResponseDTO>;
    refresh(refreshToken: string): Promise<Omit<AuthResponseDTO, "refreshToken">>;
    logout(refreshToken: string): Promise<void>;
    forgotPassword(data: ForgotPasswordRequestDTO): Promise<void>;
    resetPassword(data: ResetPasswordRequestDTO): Promise<void>;
}
