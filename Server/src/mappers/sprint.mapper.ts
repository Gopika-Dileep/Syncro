import { ISprint } from '../models/sprint.model';
import { SprintResponseDTO, CreateSprintRequestDTO } from '../dto/sprint.dto';
import { IssueResponseDTO } from '../dto/issue.dto';
import { Types } from 'mongoose';

export class SprintMapper {
  static toResponseDTO(sprint: ISprint, committedPoints: number = 0, itemCount: number = 0, completedPoints: number = 0, issues?: IssueResponseDTO[]): SprintResponseDTO {
    return {
      _id: (sprint._id as Types.ObjectId).toString(),
      company_id: sprint.company_id.toString(),
      project_id: sprint.project_id ? sprint.project_id.toString() : '',
      name: sprint.name,
      sprint_number: sprint.sprint_number,
      goal: sprint.goal,
      total_points: sprint.total_points,
      committed_points: committedPoints,
      completed_points: completedPoints,
      item_count: itemCount,
      status: sprint.status,
      start_date: sprint.start_date.toISOString(),
      end_date: sprint.end_date.toISOString(),
      issues: issues,
      created_at: sprint.created_at.toISOString(),
      updated_at: sprint.updated_at.toISOString(),
    };
  }

  static toResponseList(sprints: ISprint[]): SprintResponseDTO[] {
    return sprints.map((sprint) => this.toResponseDTO(sprint, 0));
  }

  static toCreate(data: CreateSprintRequestDTO, companyId: string): Partial<ISprint> {
    return {
      company_id: new Types.ObjectId(companyId),
      project_id: new Types.ObjectId(data.project_id),
      name: data.name,
      sprint_number: data.sprint_number,
      goal: data.goal,
      total_points: data.total_points,
      status: data.status,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
    };
  }
}
