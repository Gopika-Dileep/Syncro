import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface UserStory {
    _id: string;
    project_id: string;
    title: string;
    criteria: string[];
    story_points: number;
    priority: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface UserStoryFormData {
    project_id: string;
    title: string;
    criteria: string[];
    story_points: number;
    priority: string;
    status?: string;
}

export const getUserStoriesByProjectApi = async (projectId: string): Promise<{ success: boolean; data: UserStory[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.USER_STORIES.BY_PROJECT(projectId));
    return response.data;
};

export const getUserStoryByIdApi = async (id: string): Promise<{ success: boolean; data: UserStory }> => {
    const response = await axiosInstance.get(ENDPOINTS.USER_STORIES.BY_ID(id));
    return response.data;
};

export const createUserStoryApi = async (data: UserStoryFormData): Promise<{ success: boolean; data: UserStory }> => {
    const response = await axiosInstance.post(ENDPOINTS.USER_STORIES.BASE, data);
    return response.data;
};

export const updateUserStoryApi = async (id: string, data: Partial<UserStoryFormData>): Promise<{ success: boolean; data: UserStory }> => {
    const response = await axiosInstance.put(ENDPOINTS.USER_STORIES.BY_ID(id), data);
    return response.data;
};

export const deleteUserStoryApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(ENDPOINTS.USER_STORIES.BY_ID(id));
    return response.data;
};
