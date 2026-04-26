import { ProjectInsightsDTO } from '../../dto/project.dto';

export interface IGetProjectInsightsService {
  execute(projectId: string): Promise<ProjectInsightsDTO>;
}
