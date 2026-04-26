import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface TaskPersonRef {
    _id: string;
    name: string;
    avatar?: string;
    designation?: string;
}

export interface Task {
    _id: string;
    user_story_id: string;
    sprint_id: string;
    company_id?: string;
    team_id?: TaskPersonRef | null;
    created_by?: TaskPersonRef | null;
    assigned_by?: TaskPersonRef | null;
    title: string;
    description?: string;
    status: string;
    priority: string;
    task_type: string;
    assign_to?: TaskPersonRef | null;
    estimated_hours: number;
    actual_hours: number;
    rework_reason?: string;
    branch_name?: string;
    submission_link?: string;
    submission_description?: string;
    created_at: string;
    updated_at: string;
}

export interface TaskFormData {
    user_story_id: string;
    sprint_id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assign_to?: string;
    estimated_hours?: number;
    actual_hours?: number;
    rework_reason?: string;
    branch_name?: string;
    submission_link?: string;
    submission_description?: string;
}

export const createTaskApi = async (data: TaskFormData): Promise<{ success: boolean; data: Task }> => {
    const response = await axiosInstance.post(ENDPOINTS.TASKS.BASE, data);
    return response.data;
};

export const getTasksByStoryApi = async (storyId: string): Promise<{ success: boolean; data: Task[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.TASKS.BY_STORY(storyId));
    return response.data;
};

export const getTaskByIdApi = async (id: string): Promise<{ success: boolean; data: Task }> => {
    const response = await axiosInstance.get(ENDPOINTS.TASKS.BY_ID(id));
    return response.data;
};

export const updateTaskApi = async (id: string, data: Partial<TaskFormData>): Promise<{ success: boolean; data: Task }> => {
    const response = await axiosInstance.put(ENDPOINTS.TASKS.BY_ID(id), data);
    return response.data;
};

export const deleteTaskApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(ENDPOINTS.TASKS.BY_ID(id));
    return response.data;
};

export const assignTaskApi = async (id: string, employeeId: string): Promise<{ success: boolean; data: Task }> => {
    const response = await axiosInstance.patch(ENDPOINTS.TASKS.ASSIGN(id), { assign_to: employeeId });
    return response.data;
};

export const getAssignedTasksApi = async (): Promise<{ success: boolean; data: Task[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.TASKS.ASSIGNED);
    return response.data;
};

export const getTeamTasksApi = async (): Promise<{ success: boolean; data: Task[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.TASKS.TEAM);
    return response.data;
};

export const getAllTasksApi = async (): Promise<{ success: boolean; data: Task[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.TASKS.ALL);
    return response.data;
};

