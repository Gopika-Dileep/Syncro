import { env } from '../config/env';

export const passwordResetTemplate = (resetToken: string): { subject: string; html: string } => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return {
    subject: `Password Reset Request - ${env.EMAIL_FROM_NAME}`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
                <h2 style="color: #4f46e5;">Reset your password</h2>
                <p>We received a request to reset your Syncro account password.</p>
                <p>Click the button below. This link expires in <strong>${env.PASSWORD_RESET_EXPIRY / 60} minutes</strong>.</p>
                <a href="${resetLink}"
                   style="display:inline-block; margin-top:12px; padding:12px 24px;
                          background:#4f46e5; color:#fff; border-radius:6px;
                          text-decoration:none; font-weight:bold;">
                    Reset Password
                </a>
                <p style="margin-top:24px; color:#999; font-size:12px;">
                    If you did not request this, you can safely ignore this email.
                    Your password will not change.
                </p>
            </div>
        `,
  };
};

export const employeeInvitationTemplate = (employeeName: string, companyName: string, password: string): { subject: string; html: string } => {
  const loginLink = `${env.FRONTEND_URL}/login`;

  return {
    subject: `You're invited to join ${companyName} `,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
                <h2 style="color: #4f46e5;">Welcome to ${companyName}!</h2>
                <p>Hi <strong>${employeeName}</strong>,</p>
                <p>You have been added to <strong>${companyName}</strong>.</p>
                <p>Here are your login credentials:</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Login URL:</td>
                        <td style="padding: 8px;"><a href="${loginLink}">${loginLink}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;">Password:</td>
                        <td style="padding: 8px;">${password}</td>
                    </tr>
                </table>
                <p style="margin-top: 16px;">Please change your password after first login.</p>
                <p style="color: #999; font-size: 12px; margin-top: 24px;">
                    If you think this was a mistake, please ignore this email.
                </p>
            </div>
        `,
  };
};

export const otpEmailTemplate = (otp: string): { subject: string; html: string } => {
  return {
    subject: `Your Registration OTP - ${env.EMAIL_FROM_NAME}`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
                <h2 style="color: #4f46e5;">Verify your email address</h2>
                <p>Thank you for registering. Please use the following OTP to complete your registration:</p>
                <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; text-align: center; border-radius: 8px;">
                    <h1 style="letter-spacing: 4px; color: #333; margin: 0;">${otp}</h1>
                </div>
                <p>This code is valid for <strong>${env.OTP_EXPIRY / 60} minutes</strong>.</p>
                <p style="margin-top:24px; color:#999; font-size:12px;">
                    If you did not request this, you can safely ignore this email.
                </p>
            </div>
        `,
  };
};
