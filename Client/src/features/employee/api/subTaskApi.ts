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
    sprint_status?: string;
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
    blocked_reason?: string;
    branch_name?: string;
    submission_link?: string;
    submission_description?: string;
    parent_issue?: {
        _id: string;
        title: string;
        type: string;
        status: string;
    } | null;
    comments?: {
        user: SubTaskPersonRef | null;
        text: string;
        created_at: string;
        attachments?: { file_url: string; file_name: string }[];
        mentions?: string[];
    }[];
    attachments?: {
        file_url: string;
        file_name: string;
        uploaded_by: SubTaskPersonRef | null;
        mentions?: string[];
        uploaded_at: string;
    }[];
    history?: {
        action: string;
        from?: string;
        to?: string;
        user: SubTaskPersonRef | null;
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
    blocked_reason?: string;
    branch_name?: string;
    submission_link?: string;
    submission_description?: string;
    mentions?: string[];
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

export const submitSubTaskApi = async (id: string, data: { submission_link?: string; submission_description?: string; branch_name?: string; mentions?: string[] }): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBTASKS.SUBMIT(id), data);
    return response.data;
};

export const reviewSubTaskApi = async (id: string, data: { action: 'approve' | 'reject'; rework_reason?: string }): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.patch(ENDPOINTS.SUBTASKS.REVIEW(id), data);
    return response.data;
};

export const addCommentToSubTaskApi = async (id: string, data: { text: string; attachments?: { file_url: string; file_name: string }[]; mentions?: string[] }): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.post(ENDPOINTS.SUBTASKS.COMMENT(id), data);
    return response.data;
};

export const addAttachmentToSubTaskApi = async (id: string, attachments: { file_url: string; file_name: string }[], mentions?: string[]): Promise<{ success: boolean; data: SubTask }> => {
    const response = await axiosInstance.post(ENDPOINTS.SUBTASKS.ATTACHMENT(id), { attachments, mentions });
    return response.data;
};
