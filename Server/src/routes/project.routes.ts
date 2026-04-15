import { Router } from 'express';
import { container } from '../di/inversify.config';
import { ProjectController } from '../controller/project.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema, GetProjectsRequestSchema } from '../dto/project.dto';
import { ENDPOINTS } from '../constants/endpoints';

const projectController = container.get<ProjectController>(TYPES.ProjectController);

export class ProjectRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.post(ENDPOINTS.PROJECTS.ROOT, authMiddleware, checkPermission('project:create'), validateRequest(CreateProjectRequestSchema), projectController.createProject);
    this.router.get(ENDPOINTS.PROJECTS.ROOT, authMiddleware, checkPermission('project:view:all'), validateRequest(GetProjectsRequestSchema), projectController.getProjects);
    this.router.get(ENDPOINTS.PROJECTS.BY_PROJECT_ID, authMiddleware, checkPermission('project:view:all'), projectController.getProjectById);
    this.router.put(ENDPOINTS.PROJECTS.BY_PROJECT_ID, authMiddleware, checkPermission('project:update'), validateRequest(UpdateProjectRequestSchema), projectController.updateProject);
    this.router.delete(ENDPOINTS.PROJECTS.BY_PROJECT_ID, authMiddleware, checkPermission('project:delete'), projectController.deleteProject);
  }
}
