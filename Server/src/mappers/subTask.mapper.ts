import { ISubTask } from '../models/subTask.model';
import { IIssue } from '../models/issue.model';
import { SubTaskResponseDTO, SubTaskPersonRef } from '../dto/subTask.dto';
import { SubTaskStatus, SubTaskPriority } from '../enums/SubTaskEnums';

function extractRef(ref: unknown): SubTaskPersonRef | null {
  if (!ref) return null;
  const obj = ref as Record<string, unknown>;

  if (obj.user_id && typeof obj.user_id === 'object') {
    const userObj = obj.user_id as Record<string, unknown>;
    return {
      _id: obj._id?.toString() ?? '',
      name: (userObj.name as string) ?? '',
      avatar: userObj.avatar as string | undefined,
      designation: obj.designation as string | undefined,
      team_name: (obj.team_id as Record<string, unknown>)?.name as string | undefined,
    };
  }

  if (obj.name) {
    return { _id: obj._id?.toString() ?? '', name: obj.name as string };
  }

  return { _id: String(ref), name: '' };
}

export class SubTaskMapper {
  static toResponseDTO(subTask: ISubTask): SubTaskResponseDTO {
    const t = subTask as unknown as Record<string, unknown>;
    return {
      _id: subTask._id.toString(),
      issue_id: subTask.issue_id.toString(),
      sprint_id: subTask.sprint_id.toString(),
      company_id: subTask.company_id?.toString() ?? '',
      team_id: extractRef(t.team_id),
      created_by: extractRef(t.created_by),
      assigned_by: extractRef(t.assigned_by),
      title: subTask.title,
      description: subTask.description,
      status: subTask.status,
      priority: subTask.priority,
      subtask_type: 'sub-task',
      assignee_id: extractRef(t.assignee_id),
      estimated_hours: subTask.estimated_hours,
      actual_hours: subTask.actual_hours,
      rework_reason: subTask.rework_reason,
      branch_name: subTask.branch_name,
      submission_link: subTask.submission_link,
      submission_description: subTask.submission_description,
      comments: (subTask.comments || []).map((c) => ({
        user: extractRef(c.user),
        text: c.text,
        created_at: c.created_at.toISOString(),
      })),
      created_at: subTask.created_at.toISOString(),
      updated_at: subTask.updated_at.toISOString(),
    };
  }

  static fromIssue(issue: IIssue): SubTaskResponseDTO {
    const i = issue as unknown as Record<string, unknown>;
    const assignee = i.assignee_id as Record<string, unknown> | undefined;
    const assigneeTeam = assignee?.team_id as Record<string, unknown> | undefined;

    return {
      _id: issue._id.toString(),
      issue_id: issue._id.toString(),
      sprint_id: issue.sprint_id?.toString() ?? '',
      company_id: issue.company_id.toString(),
      team_id: assigneeTeam ? { _id: String(assigneeTeam._id), name: String(assigneeTeam.name || '') } : null,
      created_by: extractRef(i.created_by),
      assigned_by: extractRef(i.assigned_by),
      title: issue.title,
      description: issue.description,
      status: issue.status as unknown as SubTaskStatus,
      priority: issue.priority as unknown as SubTaskPriority,
      subtask_type: issue.type,
      assignee_id: extractRef(i.assignee_id),
      estimated_hours: issue.type === 'story' ? issue.story_points || 0 : issue.estimated_hours || 0,
      actual_hours: 0,
      rework_reason: issue.rework_reason,
      branch_name: issue.branch_name,
      submission_link: issue.submission_link,
      submission_description: issue.submission_description,
      comments: (issue.comments || []).map((c) => ({
        user: extractRef(c.user),
        text: c.text,
        created_at: c.created_at.toISOString(),
      })),
      created_at: issue.created_at.toISOString(),
      updated_at: issue.updated_at.toISOString(),
    };
  }

  static toResponseList(subTasks: ISubTask[]): SubTaskResponseDTO[] {
    return subTasks.map((subTask) => this.toResponseDTO(subTask));
  }
}
