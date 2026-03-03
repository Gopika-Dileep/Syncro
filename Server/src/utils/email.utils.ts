import transporter from '../config/nodemailer';
import { employeeInvitationTemplate, otpEmailTemplate, passwordResetTemplate } from './email.templates';
import { env } from '../config/env';

export const sendPasswordResetEmail = async(
    toEmail:string,
    resetToken:string
):Promise<void>=>{
    const {subject,html} = passwordResetTemplate(resetToken)

    await transporter.sendMail({
        from:`"syncro" <${env.EMAIL_USER}`,
        to: toEmail,
        subject,
        html, 
    })
}


export const sendEmployeeInvitationEmail = async (
    toEmail: string,
    employeeName :string,
    companyName: string,
    password :string
):Promise<void> =>{
    const {subject , html} = employeeInvitationTemplate(employeeName,companyName,password)
     await transporter.sendMail({
        from: `"Syncro" <${env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        html
     })
}


export const sendOtpEmail = async (toEmail:string,otp:string):Promise<void>=>{
    const {subject,html} = otpEmailTemplate(otp)
    await transporter.sendMail({
        from:`"Syncro <${env.EMAIL_USER}>`,
        to:toEmail,
        subject,
        html
    })
}