import axiosInstance from "./axiosinstance";

export interface PermissionScopes {
    own: boolean;
    team?: boolean;
    all: boolean;
}

export interface EmployeePermissions {
    project: {
        view: PermissionScopes;
        create: boolean;
        update: PermissionScopes;
        delete: boolean;
        archive: boolean;
        assign: boolean;
        unassign: boolean;
    };
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
    sprint: {
        view: PermissionScopes;
        create: boolean;
        update: boolean;
        delete: boolean;
        addItems: boolean;
        removeItems: boolean;
        start: boolean;
        complete: boolean;
    };
    task: {
        view: PermissionScopes;
        create: boolean;
        update: PermissionScopes;
        delete: PermissionScopes;
        assign: boolean;
        changeStatus: boolean;
        addSubtask: boolean;
        addComment: boolean;
    };
}

export interface AddEmployeeForm {
    name: string;
    email: string;
    designation: string;
    date_of_joining: string;
    date_of_birth: string;
    phone: string;
    address: string;
    skills: string;
    permissions: EmployeePermissions;
}

export interface Team{
    _id:string;
    name:string;
    created_at?:string;
}

export const addEmployeeApi = async (data: AddEmployeeForm) => {

    const payload = {
        ...data,
        skills: data.skills.split(",").map(s => s.trim()).filter(s => s !== "")
    };
    const response = await axiosInstance.post("/company/employee/add", payload);
    return response.data;
};

export const getEmployeesApi = async () => {
    const response = await axiosInstance.get("/company/employees");
    return response.data;
};

export const toggleBlockEmployeeApi = async (userId: string) => {
    const response = await axiosInstance.patch(`/company/employee/${userId}/toggle-block`);
    return response.data;
};

export const createTeamApi = async (name:string):Promise<{success:boolean; data:Team}>=>{
 const response = await axiosInstance.post('/company/teams',{name});
 return response.data
};

export const getTeamsApi = async () :Promise<{success:boolean;data:Team[]}>=>{
    const response = await axiosInstance.get("/company/teams");
    return response.data;
}
