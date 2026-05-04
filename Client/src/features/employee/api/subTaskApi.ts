import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface SubTaskPersonRef {
    _id: string;
    name: string;
    avatar?: string;
    designation?: string;
}

export interface SubTask {
    _id: string;
    issue_id: string;
    sprint_id: string;
    company_id?: string;
    team_id?: SubTaskPersonRef | null;
    created_by?: SubTaskPersonRef | null;
    assigned_by?: SubTaskPersonRef | null;
    title: string;
    description?: string;
    status: string;
    priority: string;
    subtask_type: string;
    assignee_id?: SubTaskPersonRef | null;
    estimated_hours: number;
    actual_hours: number;
    rework_reason?: string;
    branch_name?: string;
    submission_link?: string;
    submission_description?: string;
    comments?: {
        user: { _id: string; name: string; avatar?: string };
        text: string;
        created_at: string;
    }[];
    created_at: string;
    updated_at: string;
}

export interface SubTaskFormData {
    issue_id: string;
    sprint_id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    estimated_hours?: number;
    actual_hours?: number;
    rework_reason?: string;
    branch_name?: string;
    submission_link?: string;
    submission_description?: string;
}

export const createSubTaskApi = async (data: SubTaskFormData): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.post(ENDPOINTS.SUBTASKS.BASE, data);
    return response.data;
};

export const getSubTasksByIssueApi = async (issueId: string): Promise<{ success: boolean; data: SubTask[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.SUBTASKS.BY_ISSUE(issueId));
    return response.data;
};

export const getSubTaskByIdApi = async (id: string): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.get(ENDPOINTS.SUBTASKS.BY_ID(id));
    return response.data;
};

export const updateSubTaskApi = async (id: string, data: Partial<SubTaskFormData>): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.put(ENDPOINTS.SUBTASKS.BY_ID(id), data);
    return response.data;
};

export const deleteSubTaskApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(ENDPOINTS.SUBTASKS.BY_ID(id));
    return response.data;
};

export const assignSubTaskApi = async (id: string, employeeId: string): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBTASKS.ASSIGN(id), { assignee_id: employeeId });
    return response.data;
};

export const getAssignedSubTasksApi = async (search?: string): Promise<{ success: boolean; data: SubTask[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.SUBTASKS.ASSIGNED, { params: { search } });
    return response.data;
};

export const getTeamSubTasksApi = async (search?: string): Promise<{ success: boolean; data: SubTask[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.SUBTASKS.TEAM, { params: { search } });
    return response.data;
};

export const getAllSubTasksApi = async (search?: string): Promise<{ success: boolean; data: SubTask[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.SUBTASKS.ALL, { params: { search } });
    return response.data;
};

export const startSubTaskApi = async (id: string): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBTASKS.START(id));
    return response.data;
};

export const submitSubTaskApi = async (id: string, data: { submission_link: string; submission_description: string }): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBTASKS.SUBMIT(id), data);
    return response.data;
};

export const reviewSubTaskApi = async (id: string, data: { action: 'approve' | 'reject'; rework_reason?: string }): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBTASKS.REVIEW(id), data);
    return response.data;
};

export const addSubTaskCommentApi = async (id: string, text: string): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.post(`/subtasks/comment/${id}`, { text });
    return response.data;
};
