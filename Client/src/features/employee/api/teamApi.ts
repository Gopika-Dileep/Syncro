import axiosInstance from "@/features/shared/api/axiosinstance";
import { ENDPOINTS } from "@/constants/endpoints";

export interface TeamMember {
    _id: string;
    name: string;
    email: string;
    designation?: string;
}

export interface TeamDirectory {
    _id: string;
    name: string;
    members: TeamMember[];
}

export const getTeamDirectoryApi = async (): Promise<{ success: boolean; data: TeamDirectory[] }> => {
    const response = await axiosInstance.get(ENDPOINTS.TEAMS.DIRECTORY);
    return response.data;
};
