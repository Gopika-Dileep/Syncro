import { IProject } from '../models/project.model';
import { ProjectResponseDTO, CreateProjectRequestDTO, UpdateProjectRequestDTO } from '../dto/project.dto';
import { Types } from 'mongoose';

export class ProjectMapper {
  static toResponseDTO(project: IProject): ProjectResponseDTO {
    return {
      _id: (project._id as Types.ObjectId).toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      company_id: (project.company_id as Types.ObjectId).toString(),
      start_date: project.start_date.toISOString(),
      target_date: project.target_date.toISOString(),
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
    };
  }

  static toResponseList(projects: IProject[]): ProjectResponseDTO[] {
    return projects.map((project) => this.toResponseDTO(project));
  }

  static toCreate(data: CreateProjectRequestDTO, companyId: string): Partial<IProject> {
    return {
      name: data.name,
      description: data.description,
      status: data.status,
      priority: data.priority,
      start_date: new Date(data.start_date),
      target_date: new Date(data.target_date),
      company_id: new Types.ObjectId(companyId),
    };
  }

  static toUpdate(data: UpdateProjectRequestDTO): Partial<IProject> {
    const update: Record<string, unknown> = { ...data };
    if (data.start_date) update.start_date = new Date(data.start_date);
    if (data.target_date) update.target_date = new Date(data.target_date);
    return update as Partial<IProject>;
  }
}
