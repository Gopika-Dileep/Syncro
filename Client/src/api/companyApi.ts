import axiosInstance from "./axiosinstance";

export interface PermissionScopes {
    own: boolean;
    team?: boolean;
    all: boolean;
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

export interface AddEmployeeForm {
    name: string;
    email: string;
    phone: string;
    designation: string;
    date_of_joining: string;
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
    const response = await axiosInstance.post("/company/employee/add", data);
    return response.data;   //{success message}
};

export const getEmployeesApi = async (page: number = 1, limit: number = 10, search: string = "") => {
    const response = await axiosInstance.get(`/company/employees?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
};

export const toggleBlockEmployeeApi = async (userId: string) => {
    const response = await axiosInstance.patch(`/company/employee/${userId}/toggle-block`);
    return response.data;  // {success message saying "employee bolcked or employee unblocked"} along with the status
};

export const getEmployeeDetailsApi = async (userId: string) => {
    const response = await axiosInstance.get(`/company/employee/${userId}`);
    return response.data;
}


export const updateEmployeeApi = async (userId: string, data: AddEmployeeForm) => {
    const response = await axiosInstance.put(`/company/employee/${userId}`, data);
    return response.data;
};


export const createTeamApi = async (name: string): Promise<{ success: boolean; data: Team }> => {
    const response = await axiosInstance.post('/company/teams', { name });
    return response.data
};

export const getTeamsApi = async (): Promise<{ success: boolean; data: Team[] }> => {
    const response = await axiosInstance.get("/company/teams");
    return response.data;
}
