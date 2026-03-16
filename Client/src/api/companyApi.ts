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
    skills: string; // This will be sent as a comma-separated string or array depending on your preference
    permissions: EmployeePermissions;
}

export const addEmployeeApi = async (data: AddEmployeeForm) => {
    // Note: If your backend expects 'skills' as an array, we map it here:
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
