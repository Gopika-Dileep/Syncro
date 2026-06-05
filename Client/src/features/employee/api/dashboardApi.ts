import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "@/features/shared/api/axiosinstance";

export interface DashboardMetric {
  title: string;
  value: number | string;
  icon: string;
  description?: string;
  trend?: string;
}

export interface RecentBlockedItem {
  _id: string;
  title: string;
  type: string;
  priority: string;
  blocked_reason?: string;
  updated_at: string;
}

export interface RecentItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  updated_at: string;
  due_date?: string;
}

export interface EmployeeDashboardData {
  myStats: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    blocked: number;
  };
  myBlocked?: RecentBlockedItem[];
  typeStats?: {
    stories: number;
    tasks: number;
    bugs: number;
  };
  teamStats?: {
    teamName: string;
    totalMembers: number;
    teamVelocity: number;
  };
  teamMetrics?: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    blocked: number;
    statusDistribution?: {
      todo: number;
      inProgress: number;
      inReview: number;
      blocked: number;
      done: number;
    };
    workloadDistribution?: {
      assigneeName: string;
      taskCount: number;
      completedCount: number;
      avatar?: string;
      designation?: string;
    }[];
    activeSprint?: {
      endDate: string;
      completedTasks: number;
      incompleteTasks: number;
    };
    recentBlocked?: RecentBlockedItem[];
  };
  managerMetrics?: {
    companyHealthScore: number;
    totalActiveProjects: number;
    globalVelocity: number;
    completionTrend: { date: string; count: number }[];
    totalTeams: number;
    totalSprints: number;
    completedSprints: number;
    globalTypeStats: {
      stories: number;
      tasks: number;
      bugs: number;
      subtasks: number;
    };
    projectStatus?: {
      name: string;
      progress: number;
      totalItems: number;
      completedItems: number;
    }[];
    recentBlocked?: RecentBlockedItem[];
  };
  upcomingDeadlines: RecentItem[];
  availableFilters: {
    projects: { _id: string; name: string }[];
    sprints: { _id: string; name: string; sprint_number?: number }[];
    teams: { _id: string; name: string }[];
  };
}

export interface DashboardFilters {
  projectId?: string;
  sprintId?: string;
  teamId?: string;
}

export const getEmployeeDashboardApi = async (filters?: DashboardFilters): Promise<{ success: boolean; data: EmployeeDashboardData }> => {
  const response = await axiosInstance.get(ENDPOINTS.EMPLOYEE.DASHBOARD, { params: filters });
  return response.data;
};
