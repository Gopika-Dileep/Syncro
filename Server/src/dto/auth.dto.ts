import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    companyName: z.string().min(2, 'Company name is required'),
  }),
});

export const LoginRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const VerifyOtpRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

export const ResendOtpRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const ForgotPasswordRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const ResetPasswordRequestSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export type RegisterRequestDTO = z.infer<typeof RegisterRequestSchema>['body'];
export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>['body'];
export type VerifyOtpRequestDTO = z.infer<typeof VerifyOtpRequestSchema>['body'];
export type ResendOtpRequestDTO = z.infer<typeof ResendOtpRequestSchema>['body'];
export type ForgotPasswordRequestDTO = z.infer<typeof ForgotPasswordRequestSchema>['body'];
export type ResetPasswordRequestDTO = z.infer<typeof ResetPasswordRequestSchema>['body'];

export interface AuthUserDTO {
  id: string;
  name: string;
  role: string;
  designation: string | null;
  companyName: string | null;
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
  permissions: string[];
}
