import { 
    ProjectResponseDTO, 
    PaginatedProjectResponseDTO, 
    CreateProjectRequestDTO, 
    GetProjectsRequestDTO, 
    UpdateProjectRequestDTO 
} from '../../dto/project.dto';

export interface IProjectService {
  createProject(userId: string, data: CreateProjectRequestDTO): Promise<{ message: string; project: ProjectResponseDTO }>;
  getProjects(userId: string, query: GetProjectsRequestDTO): Promise<PaginatedProjectResponseDTO>;
  getProjectById(projectId: string): Promise<ProjectResponseDTO>;
  updateProject(projectId: string, data: UpdateProjectRequestDTO): Promise<ProjectResponseDTO>;
  deleteProject(projectId: string): Promise<void>;
}
