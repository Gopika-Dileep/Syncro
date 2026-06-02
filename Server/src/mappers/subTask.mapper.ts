import { ISubTask } from '../models/subTask.model';
import { IIssue } from '../models/issue.model';
import { SubTaskResponseDTO, SubTaskPersonRef } from '../dto/subTask.dto';
import { SubTaskStatus, SubTaskPriority } from '../enums/SubTaskEnums';

function extractRef(ref: unknown): SubTaskPersonRef | null {
  if (!ref) return null;

  if (typeof ref === 'object' && ref !== null) {
    const obj = ref as {
      _id?: unknown;
      user_id?: { name?: string; avatar?: string };
      designation?: string;
      team_id?: { name?: string };
      name?: string;
    };
    if (obj._id) {
      const userId = obj.user_id;
      if (typeof userId === 'object' && userId !== null) {
        return {
          _id: String(obj._id),
          name: String(userId.name || ''),
          designation: String(obj.designation || ''),
          avatar: userId.avatar ? String(userId.avatar) : undefined,
          team_name: obj.team_id?.name ? String(obj.team_id.name) : undefined,
        };
      }
      return {
        _id: String(obj._id),
        name: obj.name ? String(obj.name) : '',
        designation: String(obj.designation || ''),
      };
    }
  }

  const obj = ref as { _id?: { toString(): string }; name?: string };
  return {
    _id: obj._id?.toString() ?? String(ref),
    name: obj.name ? String(obj.name) : '',
  };
}

interface IPopulatedIssue {
  _id: string;
  title: string;
  type: string;
  status: string;
}

export class SubTaskMapper {
  static toResponseDTO(subTask: ISubTask): SubTaskResponseDTO {
    const t = subTask as unknown as Record<string, unknown>;
    return {
      _id: subTask._id.toString(),
      issue_id: typeof t.issue_id === 'object' && t.issue_id !== null ? String((t.issue_id as IPopulatedIssue)._id) : String(t.issue_id),
      sprint_id: t.sprint_id && String(t.sprint_id) !== 'null' && String(t.sprint_id) !== 'undefined' ? (typeof t.sprint_id === 'object' && 'status' in (t.sprint_id as Record<string, unknown>) ? String((t.sprint_id as { _id: string })._id) : String(t.sprint_id)) : undefined,
      sprint_status: typeof t.sprint_id === 'object' && t.sprint_id !== null && 'status' in (t.sprint_id as Record<string, unknown>) && (t.sprint_id as Record<string, unknown>).status !== undefined ? String((t.sprint_id as { status: string }).status) : undefined,
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
      assign_to: extractRef(t.assignee_id),
      estimated_hours: subTask.estimated_hours,
      actual_hours: subTask.actual_hours,
      rework_reason: subTask.rework_reason,
      blocked_reason: subTask.blocked_reason,
      branch_name: subTask.branch_name,
      submission_link: subTask.submission_link,
      submission_description: subTask.submission_description,
      parent_issue:
        t.issue_id && typeof t.issue_id === 'object'
          ? {
              _id: String((t.issue_id as IPopulatedIssue)._id),
              title: String((t.issue_id as IPopulatedIssue).title),
              type: String((t.issue_id as IPopulatedIssue).type),
              status: String((t.issue_id as IPopulatedIssue).status),
            }
          : null,
      comments: (subTask.comments || []).map((c) => ({
        user: extractRef(c.user),
        text: c.text || '',
        attachments: c.attachments || [],
        created_at: c.created_at ? (typeof c.created_at === 'string' ? c.created_at : c.created_at.toISOString()) : new Date().toISOString(),
      })),
      attachments: (subTask.attachments || []).map((a) => ({
        file_url: a.file_url || '',
        file_name: a.file_name || '',
        uploaded_by: extractRef(a.uploaded_by),
        uploaded_at: a.uploaded_at ? (typeof a.uploaded_at === 'string' ? a.uploaded_at : a.uploaded_at.toISOString()) : new Date().toISOString(),
      })),
      history: (subTask.history || []).map((h) => ({
        action: h.action || 'updated',
        from: h.from,
        to: h.to,
        user: extractRef(h.user),
        created_at: h.created_at ? (typeof h.created_at === 'string' ? h.created_at : h.created_at.toISOString()) : new Date().toISOString(),
      })),
      created_at: safeDate(subTask.created_at),
      updated_at: safeDate(subTask.updated_at),
    };
  }

  static fromIssue(issue: IIssue): SubTaskResponseDTO {
    const i = issue as unknown as Record<string, unknown>;
    const assignee = i.assignee_id as Record<string, unknown> | undefined;
    const assigneeTeam = assignee?.team_id as Record<string, unknown> | undefined;

    return {
      _id: issue._id.toString(),
      issue_id: issue._id.toString(),
      sprint_id: i.sprint_id && String(i.sprint_id) !== 'null' && String(i.sprint_id) !== 'undefined' ? (typeof i.sprint_id === 'object' && 'status' in (i.sprint_id as Record<string, unknown>) ? String((i.sprint_id as { _id: string })._id) : String(i.sprint_id)) : undefined,
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
      assign_to: extractRef(i.assignee_id),
      estimated_hours: issue.type === 'story' ? issue.story_points || 0 : issue.estimated_hours || 0,
      actual_hours: 0,
      rework_reason: issue.rework_reason,
      blocked_reason: issue.blocked_reason,
      branch_name: issue.branch_name,
      submission_link: issue.submission_link,
      submission_description: issue.submission_description,
      comments: (issue.comments || []).map((c) => ({
        user: extractRef(c.user),
        text: c.text || '',
        attachments: c.attachments || [],
        created_at: safeDate(c.created_at),
      })),
      attachments: (issue.attachments || []).map((a) => ({
        file_url: a.file_url || '',
        file_name: a.file_name || '',
        uploaded_by: extractRef(a.uploaded_by),
        uploaded_at: safeDate(a.uploaded_at),
      })),
      history: (issue.history || []).map((h) => ({
        action: h.action || 'updated',
        from: h.from,
        to: h.to,
        user: extractRef(h.user),
        created_at: safeDate(h.created_at),
      })),
      created_at: safeDate(issue.created_at),
      updated_at: safeDate(issue.updated_at),
    };
  }

  static toResponseList(subTasks: ISubTask[]): SubTaskResponseDTO[] {
    return subTasks.map((subTask) => this.toResponseDTO(subTask));
  }
}

function safeDate(date: unknown): string {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  if (date && typeof (date as { toISOString?: () => string }).toISOString === 'function') {
    return (date as { toISOString: () => string }).toISOString();
  }
  return new Date(date as string | number | Date).toISOString();
}
