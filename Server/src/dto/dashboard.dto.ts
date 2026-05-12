export interface CompanyDashboardDTO {
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
  recentBlocked: any[];
}

export interface EmployeeDashboardDTO {
  myStats: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    blocked: number;
  };
  typeStats: {
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
    statusDistribution: {
      todo: number;
      inProgress: number;
      inReview: number;
      blocked: number;
      done: number;
    };
    workloadDistribution?: {
      assigneeName: string;
      taskCount: number;
      avatar?: string;
    }[];
    activeSprint?: {
      endDate: string;
      completedTasks: number;
      incompleteTasks: number;
    };
    recentBlocked?: any[];
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
    recentBlocked?: any[];
  };
  myFocus?: {
    currentTask?: {
      _id: string;
      title: string;
      priority: string;
    };
    nextDeadline?: string;
    dailyProgress: number;
  };
  upcomingDeadlines: any[];
  recentActivity: any[];
  debug?: {
    userId: string;
    employeeId: string;
    permissions?: string[];
  };
}


