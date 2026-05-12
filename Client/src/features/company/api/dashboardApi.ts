import axiosInstance from "@/features/shared/api/axiosinstance";

export interface CompanyDashboardData {
  totalEmployees: number;
  totalProjects: number;
  totalTeams: number;
  issueStats: {
    total: number;
    stories: number;
    tasks: number;
    bugs: number;
  };
  statusDistribution: {
    todo: number;
    inProgress: number;
    inReview: number;
    blocked: number;
    done: number;
  };
  completedSprints: number;
  totalSprints: number;
  recentBlocked: {
    _id: string;
    title: string;
    priority: string;
    blocked_reason: string;
    updated_at: string;
  }[];
}

export const getCompanyDashboardApi = async (): Promise<{ success: boolean; data: CompanyDashboardData }> => {
  const response = await axiosInstance.get('/dashboard/company');
  return response.data;
};
