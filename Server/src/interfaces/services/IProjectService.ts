import { ProjectResponseDTO, CreateProjectRequestDTO, UpdateProjectRequestDTO } from '../../dto/project.dto';

export interface IProjectService {
  createProject(userId: string, data: CreateProjectRequestDTO): Promise<ProjectResponseDTO>;
  getProjects(userId: string): Promise<ProjectResponseDTO[]>;
  getProjectById(projectId: string): Promise<ProjectResponseDTO>;
  updateProject(projectId: string, data: UpdateProjectRequestDTO): Promise<ProjectResponseDTO>;
  deleteProject(projectId: string): Promise<void>;
}
