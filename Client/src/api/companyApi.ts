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


export interface UserProfile {
    _id: string;
    user_id: {
        _id: string;
        name: string;
        email: string;
        role: string;
        created_at: string;
    };
    designation?: string;
    phone?: string;
    address?: string;
    skills?: string[];
    date_of_joining?: string;
    team?: { _id: string; name: string } | null; 
}




export interface Team {
    _id: string;
    name: string;
    created_at?: string;
}

export const addEmployeeApi = async (data: AddEmployeeForm) => {

    const payload = {
        ...data,
        skills: data.skills.split(",").map(s => s.trim()).filter(s => s !== "")
    };
    const response = await axiosInstance.post("/company/employee/add", payload);
    return response.data;   //{success message}
};

export const getEmployeesApi = async () => {
    const response = await axiosInstance.get("/company/employees");
    return response.data;    //{employee data in array of objects}
};

export const toggleBlockEmployeeApi = async (userId: string) => {
    const response = await axiosInstance.patch(`/company/employee/${userId}/toggle-block`);
    return response.data;  // {success message saying "employee bolcked or employee unblocked"} along with the status
};

export const getEmployeeDetailsApi = async (userId: string) => {
    const response = await axiosInstance.get(`/company/employee/${userId}`);
    return response.data;
}

export const updateEmployeeDetailsApi = async (userId:string,data:Partial<UserProfile>)=>{
    const response = await axiosInstance.put(`/company/employee/${userId}`,data);
    return response.data;
}

export const createTeamApi = async (name: string): Promise<{ success: boolean; data: Team }> => {
    const response = await axiosInstance.post('/company/teams', { name });
    return response.data
};

export const getTeamsApi = async (): Promise<{ success: boolean; data: Team[] }> => {
    const response = await axiosInstance.get("/company/teams");
    return response.data;
}
