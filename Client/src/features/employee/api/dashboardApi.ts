import axiosInstance from "@/features/shared/api/axiosinstance";

export interface DashboardMetric {
  title: string;
  value: number | string;
  icon: string;
  description?: string;
  trend?: string;
}

export interface RecentItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  updated_at: string;
}

export interface EmployeeDashboardData {
  myStats: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    blocked: number;
  };
  teamStats?: {
    teamName: string;
    totalMembers: number;
    teamVelocity: number;
  };
  managerMetrics?: {
    projectStatus: { name: string; progress: number }[];
    recentBlocked: RecentItem[];
  };
  teamMetrics?: {
    workloadDistribution: { name: string; count: number }[];
    recentBlocked: RecentItem[];
  };
  upcomingDeadlines: RecentItem[];
  availableFilters: {
    projects: { _id: string; name: string }[];
    sprints: { _id: string; name: string }[];
    teams: { _id: string; name: string }[];
  };
}

export interface DashboardFilters {
  projectId?: string;
  sprintId?: string;
  teamId?: string;
}

export const getEmployeeDashboardApi = async (filters?: DashboardFilters): Promise<{ success: boolean; data: EmployeeDashboardData }> => {
  const response = await axiosInstance.get('/dashboard/employee', { params: filters });
  return response.data;
};
