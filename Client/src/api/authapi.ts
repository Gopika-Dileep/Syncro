import axiosInstance from "./axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export const registerApi = async (name: string, email: string, password: string, companyName:string) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, { name, email, password, companyName })
    return response.data  // {success message}  {otp will be sent to email}
}

export const verifyOtpApi = async (email:string ,otp:string)=>{
    const response = await axiosInstance.post(ENDPOINTS.AUTH.VERIFY_OTP,{email,otp})
    return response.data   //{ accessToken, user:userPayload, permissions } ,{refresh token is set in the cookies}
    
}

export const resendOtpApi = async (email:string) =>{
    const response = await axiosInstance.post(ENDPOINTS.AUTH.RESEND_OTP,{email})
    return response.data;   // {success message}  {otp will be send to email}
}

export const loginApi = async (email: string, password: string) => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, { email, password })
    return response.data  //{accessToken, user:userPayload, permissions}   {refresh token will be set in the cookies}
}

export const forgotPasswordApi =  async (email:string)=>{
    const response = await axiosInstance.post (ENDPOINTS.AUTH.FORGOT_PASSWORD,{email})
    return response.data  //{success message} {and an email is send with reset password link}
}

export const resetPasswordApi = async(token:string,newPassword:string)=>{
    const response = await axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD,{token,newPassword})
    return response.data   //{success message}
}

export const refreshTokenApi = async () => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.REFRESH, {})
    return response.data   //{accessToken, user:userPayload, permissions} 
}

export const logoutApi = async () => {
    const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT, {})
    return response.data //{success message} {refresh token will be removed from database and cookies}
}
