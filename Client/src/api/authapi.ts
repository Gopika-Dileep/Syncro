import axiosInstance from "./axiosinstance";

export const registerApi = async (name: string, email: string, password: string, companyName:string) => {

    const response = await axiosInstance.post("/auth/register", { name, email, password, companyName })
    return response.data
}

export const loginApi = async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", { email, password })
    return response.data
}

export const forgotPasswordApi =  async (email:string)=>{
    const response = await axiosInstance.post ("/auth/forget-password",{email})
    return response.data
}

export const resetPasswordApi = async(token:string,newPassword:string)=>{
    const response = await axiosInstance.post("/auth/reset-password",{token,newPassword})
    return response.data
}

export const refreshTokenApi = async () => {
    const response = await axiosInstance.post("/auth/refresh", {})
    return response.data   
}

export const logoutApi = async () => {
    const response = await axiosInstance.post("/auth/logout", {})
    return response.data
}
