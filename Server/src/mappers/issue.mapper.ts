import { IIssue } from '../models/issue.model';
import { IssueResponseDTO } from '../dto/issue.dto';

function extractEmployee(ref: unknown): { _id: string; name: string; designation: string } | undefined {
  if (!ref) return undefined;

  if (typeof ref === 'object' && ref !== null) {
    const obj = ref as Record<string, unknown>;
    if (obj.user_id && typeof obj.user_id === 'object') {
      const user = obj.user_id as Record<string, unknown>;
      return {
        _id: String(obj._id),
        name: String(user.name || ''),
        designation: String(obj.designation || ''),
      };
    }
    if (obj._id) {
      return {
        _id: String(obj._id),
        name: String(obj.name || ''),
        designation: String(obj.designation || ''),
      };
    }
  }

  return {
    _id: String(ref),
    name: '',
    designation: '',
  };
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
      mentions: issue.mentions?.map((m) => m.toString()) || [],
      comments: (issue.comments || []).map((c) => ({
        user: extractEmployee(c.user) || null,
        text: c.text,
        created_at: c.created_at.toISOString(),
      })),
      created_at: issue.created_at.toISOString(),
      updated_at: issue.updated_at.toISOString(),
    };
  }

  static toResponseList(issues: IIssue[]): IssueResponseDTO[] {
    return issues.map((issue) => this.toResponseDTO(issue));
  }
}
