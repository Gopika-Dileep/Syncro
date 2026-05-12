import axiosInstance from "@/features/shared/api/axiosinstance";

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
  upcomingDeadlines: {
    _id: string;
    title: string;
    priority: string;
    status: string;
  }[];
  recentActivity: any[];
}

export const getEmployeeDashboardApi = async (): Promise<{ success: boolean; data: EmployeeDashboardData }> => {
  const response = await axiosInstance.get('/dashboard/employee');
  return response.data;
};
