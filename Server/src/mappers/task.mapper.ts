import { ITask } from '../models/task.model';
import { IUserStory } from '../models/userStory.model';
import { TaskResponseDTO, TaskPersonRef } from '../dto/task.dto';
import { IssueType } from '../enums/UserStoryEnums';
import { TaskStatus, TaskPriority } from '../enums/TaskEnums';

/** Extracts {_id, name, avatar} from a populated ref or returns null */
function extractRef(ref: unknown): TaskPersonRef | null {
  if (!ref) return null;
  const obj = ref as Record<string, unknown>;
  // Populated Employee ref: { _id, user_id: { _id, name, avatar } }
  if (obj.user_id && typeof obj.user_id === 'object') {
    const userObj = obj.user_id as Record<string, unknown>;
    return {
      _id: obj._id?.toString() ?? '',
      name: (userObj.name as string) ?? '',
      avatar: userObj.avatar as string | undefined,
      designation: obj.designation as string | undefined,
    };
  }
  // Populated Team ref: { _id, name }
  if (obj.name) {
    return { _id: obj._id?.toString() ?? '', name: obj.name as string };
  }
  // Raw ObjectId
  return { _id: String(ref), name: '' };
}

export class TaskMapper {
  static toResponseDTO(task: ITask): TaskResponseDTO {
    const t = task as unknown as Record<string, unknown>;
    return {
      _id: task._id.toString(),
      user_story_id: task.user_story_id.toString(),
      sprint_id: task.sprint_id.toString(),
      company_id: task.company_id?.toString() ?? '',
      team_id: extractRef(t.team_id),
      created_by: extractRef(t.created_by),
      assigned_by: extractRef(t.assigned_by),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      task_type: IssueType.TASK, // Default for sub-tasks
      assign_to: extractRef(t.assign_to),
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours,
      rework_reason: task.rework_reason,
      branch_name: task.branch_name,
      submission_link: task.submission_link,
      submission_description: task.submission_description,
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString(),
    };
  }

  static fromIssue(issue: IUserStory): TaskResponseDTO {
    const i = issue as unknown as Record<string, unknown>;
    return {
      _id: issue._id.toString(),
      user_story_id: issue._id.toString(), // For Bugs/Tasks, it's its own parent contextually
      sprint_id: issue.sprint_id?.toString() ?? '',
      company_id: issue.company_id.toString(),
      team_id: null, // Issues don't have direct team_id usually, can be added if needed
      created_by: extractRef(i.created_by), 
      assigned_by: extractRef(i.assigned_by),
      title: issue.title,
      description: issue.description,
      status: issue.status as unknown as TaskStatus, // Map UserStoryStatus to TaskStatus
      priority: issue.priority as unknown as TaskPriority,
      task_type: issue.type,
      assign_to: extractRef(i.assignee_id),
      estimated_hours: issue.story_points, // Story points as estimate for board
      actual_hours: 0,
      created_at: issue.created_at.toISOString(),
      updated_at: issue.updated_at.toISOString(),
    };
  }

  static toResponseList(tasks: ITask[]): TaskResponseDTO[] {
    return tasks.map((task) => this.toResponseDTO(task));
  }
}

