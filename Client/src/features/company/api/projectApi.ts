import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface Project {
    _id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    start_date: string;
    target_date: string;
    created_at: string;
    updated_at: string;
    created_by?: {
        _id: string;
        name: string;
        avatar?: string;
        designation?: string;
    };
}

export interface ProjectFormData {
    name: string;
    description: string;
    status: string;
    priority: string;
    start_date: string;
    target_date: string;
}

export interface PaginatedProjectResponse {
    success: boolean;
    data: Project[];
    total: number;
    page: number;
    limit: number;
    message: string;
}

export const getProjectsApi = async (page: number = 1, limit: number = 20, search: string = "", status: string = ""): Promise<PaginatedProjectResponse> => {
    const response = await axiosInstance.get(
        `${ENDPOINTS.PROJECTS.BASE}?page=${page}&limit=${limit}&search=${search}&status=${status}`
    );
    const resData = response.data;
    return {
        ...resData,
        data: resData.data?.projects || resData.data,
        total: resData.data?.total ?? resData.total,
        page: resData.data?.page ?? resData.page,
        limit: resData.data?.limit ?? resData.limit
    };
};

export const getProjectByIdApi = async (id: string): Promise<{ success: boolean; data: Project }> => {
    const response = await axiosInstance.get(ENDPOINTS.PROJECTS.BY_ID(id));
    return response.data;
};

export const createProjectApi = async (data: ProjectFormData): Promise<{ success: boolean; data: Project; message: string }> => {
    const response = await axiosInstance.post(ENDPOINTS.PROJECTS.BASE, data);
    return response.data;
};

export const updateProjectApi = async (id: string, data: Partial<ProjectFormData>): Promise<{ success: boolean; data: Project; message: string }> => {
    const response = await axiosInstance.put(ENDPOINTS.PROJECTS.BY_ID(id), data);
    return response.data;
};

export const deleteProjectApi = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(ENDPOINTS.PROJECTS.BY_ID(id));
    return response.data;
};

export interface ProjectInsights {
    project: Project;
    stats: {
        total_stories: number;
        total_tasks: number;
        total_bugs: number;
        completed_points: number;
        total_points: number;
    };
    team: {
        _id: string;
        name: string;
        role: string;
        avatar?: string;
    }[];
    stories: {
        _id: string;
        title: string;
        type: string;
        status: string;
        priority: string;
        assign_to?: { _id: string; name: string; avatar?: string; designation?: string };
        team?: { _id: string; name: string };
        created_by?: { _id: string; name: string; designation: string; avatar?: string };
        story_points?: number;
        estimated_hours?: number;
        description?: string;
        criteria?: string[];
    }[];
    standaloneTasks: {
        _id: string;
        title: string;
        type: string;
        status: string;
        priority: string;
        assign_to?: { _id: string; name: string; avatar?: string; designation?: string };
        team?: { _id: string; name: string };
        created_by?: { _id: string; name: string; designation: string; avatar?: string };
        story_points?: number;
        estimated_hours?: number;
        description?: string;
        criteria?: string[];
    }[];
    bugs: {
        _id: string;
        title: string;
        type: string;
        status: string;
        priority: string;
        assign_to?: { _id: string; name: string; avatar?: string; designation?: string };
        team?: { _id: string; name: string };
        created_by?: { _id: string; name: string; designation: string; avatar?: string };
        story_points?: number;
        estimated_hours?: number;
        description?: string;
        criteria?: string[];
        environment?: string;
        reproduction_steps?: string;
    }[];
    tasks: {
        _id: string;
        title: string;
        status: string;
        issue_id: string;
        assign_to?: { _id: string; name: string; avatar?: string; team_name?: string };
        estimated_hours?: number;
    }[];
}

export const getProjectInsightsApi = async (projectId: string): Promise<{ success: boolean; data: ProjectInsights }> => {
    const response = await axiosInstance.get(`${ENDPOINTS.PROJECTS.BASE}/${projectId}/insights`);
    return response.data;
};
