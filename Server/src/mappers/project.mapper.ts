import { IProject } from '../models/project.model';
import { ProjectResponseDTO } from '../dto/project.dto';

export class ProjectMapper {
  static toResponseDTO(project: IProject): ProjectResponseDTO {
    return {
      _id: project._id.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      company_id: project.company_id.toString(),
      start_date: project.start_date.toISOString(),
      target_date: project.target_date.toISOString(),
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
    };
  }

  static toResponseList(projects: IProject[]): ProjectResponseDTO[] {
    return projects.map((project) => this.toResponseDTO(project));
  }
}
