import axiosInstance from "./axiosinstance";

export interface AddEmployeeForm {
    name:string
    email:string
    designation:     string
    date_of_joining: string
    date_of_birth:   string
    phone:           string
    address:         string
    skills:          string
}

export const addEmployeeApi = async(data:AddEmployeeForm)=>{
    const response = await axiosInstance.post("/company/employee/add",data)
    return response.data
}

export const getEmployeesApi = async ()=>{
    const response = await axiosInstance.get("/company/employees")
    return response.data
}

export const toggleBlockEmployeeApi = async (userId:string) =>{
    const response = await axiosInstance.patch(`/company/employee/${userId}/toggle-block`)
    return response.data
}