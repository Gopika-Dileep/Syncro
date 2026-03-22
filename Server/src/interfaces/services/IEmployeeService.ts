export interface PermissionScopes{
    own:boolean;
    team?:boolean;
    all:boolean;
}

export type PermissionAction = boolean | PermissionScopes;


export interface ModulePermissions{
    [action:string] :PermissionAction;
}

export interface EmployeePermissions{
    project:{
        view:PermissionScopes;
        create:boolean;
        update:PermissionScopes;
        delete:boolean;
        archive:boolean;
        assign:boolean;
        unassign:boolean
    };
    task:{
        view:PermissionScopes;
        create:boolean;
        update:PermissionScopes;
        delete:PermissionScopes;
        assign:boolean;
        changeStatus: boolean;
        addSubtask: boolean;
        addComment: boolean;
    };
    sprint:{
        view:PermissionScopes;
        create:boolean;
        update:boolean;
        delete:boolean;
        addItems: boolean;
        removeItems: boolean;
        start: boolean;
        complete: boolean;
    },
    userStory: {
        view: PermissionScopes;
        create: boolean;
        update: PermissionScopes;
        delete: boolean;
        assign: boolean;
        addToSprint: boolean;
        removeFromSprint: boolean;
        changeStatus: boolean;
    };
}

export interface AddEmployeeData{
    name:string
    email:string
    designation?:string
    team_id?:string
    date_of_joining?:string
    date_of_birth?:string
    phone?:string
    address?:string
    skills?:string[]
    permissions:EmployeePermissions

}

export interface IEmployeeService {
    addEmployee(companyId : string, data : AddEmployeeData):Promise <void>
    getEmployees(companyId:string): Promise<object[]>
    toggleBlockEmployee(companyId:string,userId:string):Promise<boolean>
}