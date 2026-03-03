export interface AddEmployeeData{
    name:string
    email:string
    designation?:string
    date_of_joining?:string
    date_of_birth?:string
    phone?:string
    address?:string
    skills?:string[]
}

export interface IEmployeeService {
    addEmployee(companyId : string, data : AddEmployeeData):Promise <void>
    getEmployees(companyId:string): Promise<any[]>
    toggleBlockEmployee(companyId:string,userId:string):Promise<boolean>
}