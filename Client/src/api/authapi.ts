import axiosInstance from "./axiosinstance";

export const registerApi = async (name: string, email: string, password: string, companyName:string) => {
    const response = await axiosInstance.post("/auth/register", { name, email, password, companyName })
    return response.data  // {success message}  {otp will be sent to email}
}

export const verifyOtpApi = async (email:string ,otp:string)=>{
    const response = await axiosInstance.post("/auth/verify-otp",{email,otp})
    return response.data   //{ accessToken, user:userPayload, permissions } ,{refresh token is set in the cookies}
    
}

export const resendOtpApi = async (email:string) =>{
    const response = await axiosInstance.post("/auth/resend-otp",{email})
    return response.data;   // {success message}  {otp will be send to email}
}

export const loginApi = async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", { email, password })
    return response.data  //{accessToken, user:userPayload, permissions}   {refresh token will be set in the cookies}
}

export const forgotPasswordApi =  async (email:string)=>{
    const response = await axiosInstance.post ("/auth/forgot-password",{email})
    return response.data  //{success message} {and an email is send with reset password link}
}

export const resetPasswordApi = async(token:string,newPassword:string)=>{
    const response = await axiosInstance.post("/auth/reset-password",{token,newPassword})
    return response.data   //{success message}
}

export const refreshTokenApi = async () => {
    const response = await axiosInstance.post("/auth/refresh", {})
    return response.data   //{accessToken, user:userPayload, permissions} 
}

export const logoutApi = async () => {
    const response = await axiosInstance.post("/auth/logout", {})
    return response.data //{success message} {refresh token will be removed from database and cookies}
}
