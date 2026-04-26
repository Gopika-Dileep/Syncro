import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface Sprint {
    _id: string;
    company_id: string;
    project_id?: string;
    name: string;
    sprint_number: number;
    goal: string;
    total_points: number;
    committed_points?: number; 
    item_count?: number;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface SprintFormData {
    project_id: string;
    name: string;
    sprint_number: number;
    goal: string;
    total_points: number;
    status?: string;
    start_date: string;
    end_date: string;
}

export const createSprintApi = async (data: SprintFormData): Promise<{ success: boolean; data: Sprint }> => {
    // Explicitly construct URL to avoid malformed path errors
    const url = `${ENDPOINTS.SPRINTS.BASE}`; 
    const response = await axiosInstance.post(url, data);
    // Aligning backend property 'sprint' to frontend 'data'
    return {
        success: response.data.success,
        data: response.data.sprint || response.data.data
    };
};

export interface SprintQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export const getSprintsApi = async (params?: SprintQueryParams): Promise<{ success: boolean; data: { sprints: Sprint[], total: number } }> => {
    const url = `${ENDPOINTS.SPRINTS.BASE}`;
    const response = await axiosInstance.get(url, { params });
    return response.data;
};

export const getSprintByIdApi = async (sprintId: string): Promise<{ success: boolean; data: Sprint }> => {
    const url = `${ENDPOINTS.SPRINTS.BASE}/${sprintId}`;
    const response = await axiosInstance.get(url);
    return {
        success: response.data.success,
        data: response.data.data || response.data.sprint
    };
};

export const updateSprintApi = async (sprintId: string, data: Partial<SprintFormData>): Promise<{ success: boolean; data: Sprint }> => {
    const url = `${ENDPOINTS.SPRINTS.BASE}/${sprintId}`;
    const response = await axiosInstance.patch(url, data);
    return {
        success: response.data.success,
        data: response.data.sprint || response.data.data
    };
};

export const deleteSprintApi = async (sprintId: string): Promise<{ success: boolean }> => {
    const url = `${ENDPOINTS.SPRINTS.BASE}/${sprintId}`;
    const response = await axiosInstance.delete(url);
    return response.data;
};
