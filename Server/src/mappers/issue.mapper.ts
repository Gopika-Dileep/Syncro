import { IIssue } from '../models/issue.model';
import { IssueResponseDTO } from '../dto/issue.dto';

function extractEmployee(ref: unknown): { _id: string; name: string; designation: string; avatar?: string } | undefined {
  if (!ref) return undefined;

  if (typeof ref === 'object' && ref !== null) {
    const obj = ref as {
      _id?: unknown;
      user_id?: { name?: string; avatar?: string };
      designation?: string;
    };
    if (obj._id) {
      const userId = obj.user_id;
      if (typeof userId === 'object' && userId !== null) {
        return {
          _id: String(obj._id),
          name: String(userId.name || ''),
          designation: String(obj.designation || ''),
          avatar: userId.avatar ? String(userId.avatar) : undefined,
        };
      }
      return {
        _id: String(obj._id),
        name: '',
        designation: String(obj.designation || ''),
      };
    }
  }

  if (typeof ref === 'string' || (typeof ref === 'object' && ref !== null && typeof (ref as { toString?: () => string }).toString === 'function')) {
    return {
      _id: String(ref),
      name: '',
      designation: '',
    };
  }

  return undefined;
}

function mapAssignee(ref: unknown): IssueResponseDTO['assignee_id'] {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;

  const obj = ref as Record<string, unknown>;
  if (obj.user_id && typeof obj.user_id === 'object') {
    const user = obj.user_id as Record<string, unknown>;
    const teamIdObj = obj.team_id && typeof obj.team_id === 'object' ? (obj.team_id as Record<string, unknown>) : null;
    return {
      _id: String(obj._id),
      user_id: {
        name: String(user.name || ''),
      },
      designation: String(obj.designation || ''),
      team_id: teamIdObj
        ? {
          _id: String(teamIdObj._id),
          name: String(teamIdObj.name || ''),
        }
        : obj.team_id
          ? String(obj.team_id)
          : undefined,
    };
  }
  return obj._id ? String(obj._id) : String(ref);
}

export class IssueMapper {
  static toResponseDTO(issue: IIssue): IssueResponseDTO {
    const s = issue as unknown as Record<string, unknown>;
    const assignee = s.assignee_id && typeof s.assignee_id === 'object' ? (s.assignee_id as Record<string, unknown>) : null;
    const teamId = assignee && assignee.team_id && typeof assignee.team_id === 'object' ? (assignee.team_id as Record<string, unknown>) : null;

    return {
      _id: issue._id.toString(),
      project_id: issue.project_id.toString(),
      company_id: issue.company_id?.toString() ?? '',
      sprint_id: issue.sprint_id?.toString(),
      assignee_id: mapAssignee(s.assignee_id),
      assign_to: extractEmployee(s.assignee_id),
      created_by: extractEmployee(s.created_by),
      assigned_by: extractEmployee(s.assigned_by),
      team: teamId
        ? {
          _id: String(teamId._id),
          name: String(teamId.name || ''),
        }
        : undefined,
      title: issue.title,
      description: issue.description,
      reproduction_steps: issue.reproduction_steps,
      environment: issue.environment,
      criteria: issue.criteria,
      story_points: issue.story_points,
      estimated_hours: issue.estimated_hours,
      priority: issue.priority,
      status: issue.status,
      type: issue.type,
      rework_reason: issue.rework_reason,
      blocked_reason: issue.blocked_reason,
      mentions: issue.mentions?.map((m) => m.toString()) || [],
      comments: (issue.comments || []).map((c) => ({
        user: extractEmployee(c.user) || null,
        text: c.text || '',
        attachments: c.attachments || [],
        created_at: safeDate(c.created_at),
      })),
      attachments: (issue.attachments || []).map((a) => ({
        file_url: a.file_url || '',
        file_name: a.file_name || '',
        uploaded_by: extractEmployee(a.uploaded_by) || null,
        uploaded_at: safeDate(a.uploaded_at),
      })),
      history: (issue.history || []).map((h) => ({
        action: h.action || 'updated',
        from: h.from,
        to: h.to,
        user: extractEmployee(h.user) || null,
        created_at: safeDate(h.created_at),
      })),
      created_at: safeDate(issue.created_at),
      updated_at: safeDate(issue.updated_at),
    };
  }

  static toResponseList(issues: IIssue[]): IssueResponseDTO[] {
    return issues.map((issue) => this.toResponseDTO(issue));
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
