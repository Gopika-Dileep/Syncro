import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface Issue {
    _id: string;
    project_id: string;
    company_id: string;
    sprint_id?: string | null;
    assignee_id?: {
        _id: string;
        name: string;
        designation: string;
        avatar?: string;
    } | null;
    assign_to?: {
        _id: string;
        name: string;
        designation: string;
    } | null;
    created_by?: {
        _id: string;
        name: string;
        designation: string;
    } | null;
    assigned_by?: {
        _id: string;
        name: string;
        designation: string;
    } | null;
    mentions?: {
        _id: string;
        name: string;
        designation: string;
    }[] | string[];
    title: string;
    description?: string;
    reproduction_steps?: string;
    environment?: string;
    criteria: string[];
    story_points: number;
    estimated_hours: number;
    priority: string;
    status: string;
    type: string;
    comments?: {
        user: { _id: string; name: string; avatar?: string };
        text: string;
        created_at: string;
        attachments?: { file_url: string; file_name: string }[];
    }[];
    attachments?: {
        file_url: string;
        file_name: string;
        uploaded_by: { _id: string; name: string; avatar?: string } | null;
        uploaded_at: string;
    }[];
    history?: {
        action: string;
        from?: string;
        to?: string;
        user: { _id: string; name: string; avatar?: string } | null;
        created_at: string;
    }[];
    created_at: string;
    updated_at: string;
}

export interface IssueFormData {
    project_id?: string;
    company_id?: string;
    sprint_id?: string | null;
    assignee_id?: string | null;
    title: string;
    description?: string;
    reproduction_steps?: string;
    environment?: string;
    criteria: string[];
    story_points: number;
    estimated_hours: number;
    priority: string;
    status?: string;
    type: string;
    mentions?: string[];
}

export const getIssuesByProjectApi = async (projectId: string): Promise<{ success: boolean; data: Issue[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.ISSUES.BY_PROJECT(projectId));
    return response.data;
};

export const getIssuesBySprintApi = async (sprintId: string): Promise<{ success: boolean; data: Issue[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.ISSUES.BY_SPRINT(sprintId));
    return response.data;
};

export const getIssueByIdApi = async (id: string): Promise<{ success: boolean; data: Issue }> => {
    const response = await axiosInstance.get(ENDPOINTS.ISSUES.BY_ID(id));
    return response.data;
};

export const createIssueApi = async (data: IssueFormData): Promise<{ success: boolean; data: Issue }> => {
    const response = await axiosInstance.post(ENDPOINTS.ISSUES.BASE, data);
    return response.data;
};

export const updateIssueApi = async (id: string, data: Partial<IssueFormData>): Promise<{ success: boolean; data: Issue }> => {
    const response = await axiosInstance.put(ENDPOINTS.ISSUES.BY_ID(id), data);
    return response.data;
};

export const deleteIssueApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(ENDPOINTS.ISSUES.BY_ID(id));
    return response.data;
};

export const assignIssueApi = async (id: string, data: { assignee_id: string }): Promise<{ success: boolean; data: Issue }> => {
    const response = await axiosInstance.patch(ENDPOINTS.ISSUES.ASSIGN(id), data);
    return response.data;
};

export const addCommentToIssueApi = async (id: string, data: { text: string; attachments?: { file_url: string; file_name: string }[] }): Promise<{ success: boolean; data: Issue }> => {
    const response = await axiosInstance.post(ENDPOINTS.ISSUES.COMMENT(id), data);
    return response.data;
};

export const addIssueAttachmentApi = async (id: string, attachments: { file_url: string; file_name: string }[]): Promise<{ success: boolean; data: Issue }> => {
    const response = await axiosInstance.post(ENDPOINTS.ISSUES.ATTACHMENT(id), { attachments });
    return response.data;
};
