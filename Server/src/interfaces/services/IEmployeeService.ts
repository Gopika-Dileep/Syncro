
export interface PermissionScopes{
    own:boolean;
    team?:boolean;
    all:boolean;
}

export type PermissionAction = boolean | PermissionScopes;


export interface ModulePermissions{
    [action:string] :PermissionAction;
}

export interface EmployeePermissions {
    project: {
        create: boolean;
        view: { team: boolean; all: boolean };
        update: { team: boolean; all: boolean };
        delete: boolean;
    };
    task: {
        create: boolean;
        view: { team: boolean; all: boolean };
        assign: { team: boolean; all: boolean };
        update: { team: boolean; all: boolean };
    };
    sprint: {
        create: boolean;
        view: { all: boolean };
        update: boolean;
        start: boolean;
        complete: boolean;
    };
    userStory: {
        create: boolean;
        view: { all: boolean };
        update: boolean;
        assign: boolean;
    };
    team: {
        view: { team: boolean; all: boolean };
        performance: { team: boolean; all: boolean };
    };
}

export interface AddEmployeeData{
    name:string
    email:string
    designation?:string
    phone?:string
    date_of_joining?:string
    permissions:EmployeePermissions

}

export interface IEmployeeService {
    addEmployee(companyId : string, data : AddEmployeeData):Promise <void>
    getEmployees(companyId: string, page: number, limit: number, search: string): Promise<{ employees: any[], total: number }>
    toggleBlockEmployee(companyId:string,userId:string):Promise<boolean>
    getEmployeeDetails(userId:string):Promise<Object>
    updateEmployeeDetails(userId: string, data: any): Promise<any>;
   }