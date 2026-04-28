import { IIssue } from '../models/issue.model';
import { IssueResponseDTO } from '../dto/issue.dto';

function extractEmployee(ref: unknown) {
  if (!ref) return undefined;
  const obj = ref as Record<string, unknown>;
  // If populated employee: { _id, user_id: { name, ... }, designation }
  if (obj.user_id && typeof obj.user_id === 'object') {
    const userObj = obj.user_id as Record<string, unknown>;
    return {
      _id: (obj._id as string | object).toString(),
      name: (userObj.name as string) || '',
      designation: (obj.designation as string) || '',
    };
  }
  return undefined;
}

export class IssueMapper {
  static toResponseDTO(issue: IIssue): IssueResponseDTO {
    const s = issue as unknown as Record<string, unknown>;
    return {
      _id: issue._id.toString(),
      project_id: issue.project_id.toString(),
      company_id: issue.company_id?.toString() ?? '',
      sprint_id: issue.sprint_id?.toString(),
      assignee_id: (s.assignee_id as Record<string, unknown>)?._id?.toString() || (s.assignee_id as string)?.toString(),
      assign_to: extractEmployee(s.assignee_id),
      created_by: extractEmployee(s.created_by),
      assigned_by: extractEmployee(s.assigned_by),
      parent_id: issue.parent_id?.toString(),
      team: (s.assignee_id as any)?.team_id ? {
          _id: (s.assignee_id as any).team_id._id?.toString(),
          name: (s.assignee_id as any).team_id.name || ''
      } : undefined,
      title: issue.title,
      description: issue.description,
      reproduction_steps: issue.reproduction_steps,
      environment: issue.environment,
      criteria: issue.criteria,
      story_points: issue.story_points,
      priority: issue.priority,
      status: issue.status,
      type: issue.type,
      created_at: issue.created_at.toISOString(),
      updated_at: issue.updated_at.toISOString(),
    };
  }

  static toResponseList(issues: IIssue[]): IssueResponseDTO[] {
    return issues.map((issue) => this.toResponseDTO(issue));
  }
}
