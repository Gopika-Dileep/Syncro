import { IPopulatedEmployee } from '../models/employee.model';
import { IIssue } from '../models/issue.model';
import { ISubTask } from '../models/subTask.model';

export class AIMapper {
  static toEmployeeAIData(
    emp: IPopulatedEmployee,
    activeIssues: number,
    activeSubTasks: number
  ) {
    return {
      id: emp._id.toString(),
      name: emp.user_id?.name || 'Unknown',
      skills: emp.skills || [],
      designation: emp.designation || 'Employee',
      team: (emp.team_id as any)?.name || 'Unassigned',
      activeIssues,
      activeSubTasks,
      totalActiveWorkload: activeIssues + activeSubTasks,
    };
  }

  static toTaskAIDataFromIssue(issue: IIssue) {
    return {
      title: issue.title,
      description: issue.description || '',
      priority: issue.priority,
      status: issue.status,
    };
  }

  static toTaskAIDataFromSubTask(subTask: ISubTask) {
    return {
      title: subTask.title,
      description: subTask.description || '',
      priority: subTask.priority,
      status: subTask.status,
    };
  }
}
