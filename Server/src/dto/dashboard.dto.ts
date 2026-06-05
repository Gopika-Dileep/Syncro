export interface BlockedItem {
  _id: string;
  title: string;
  type?: string;
  priority: string;
  blocked_reason?: string;
  updated_at: string | Date;
}

export interface UpcomingDeadlineItem {
  _id: string;
  title: string;
  priority: string;
  status: string;
  updated_at: string;
}

export interface RecentActivityItem {
  _id: string;
  title: string;
  description: string;
  updated_at: string;
}

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
  recentBlocked: BlockedItem[];
}

export interface EmployeeDashboardDTO {
  myStats: {
    totalAssigned: number;
    completed: number;
    inProgress: number;
    blocked: number;
  };
  myBlocked?: BlockedItem[];
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
    recentBlocked?: BlockedItem[];
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
    recentBlocked?: BlockedItem[];
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
  upcomingDeadlines: UpcomingDeadlineItem[];
  recentActivity: RecentActivityItem[];
  debug?: {
    userId: string;
    employeeId: string;
    permissions?: string[];
  };
  availableFilters?: {
    projects: { _id: string; name: string }[];
    sprints: { _id: string; name: string; sprint_number: number }[];
    teams?: { _id: string; name: string }[];
  };
}

export interface DashboardFilter {
  projectId?: string;
  sprintId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
}
