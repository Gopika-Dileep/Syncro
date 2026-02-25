import axiosInstance from "./axiosinstance";

export const registerApi = async (name: string, email: string, password: string) => {

    const response = await axiosInstance.post("/auth/register", { name, email, password })
    return response.data
}

export const loginApi = async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", { email, password })
    return response.data
}