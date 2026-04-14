export interface IDeleteProjectService {
  execute(projectId: string): Promise<void>;
}
