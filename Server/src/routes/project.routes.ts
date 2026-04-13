import { Router } from 'express';
import { container } from '../di/inversify.config';
import { ProjectController } from '../controller/project.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema, GetProjectsRequestSchema } from '../dto/project.dto';
import { ENDPOINTS } from '../constants/endpoints';

const router = Router();
const projectController = container.get<ProjectController>(TYPES.ProjectController);

router.use(authMiddleware);

// Define permissions more explicitly
const CAN_CREATE = checkPermission('project:create');
const CAN_UPDATE = checkPermission('project:update');
const CAN_DELETE = checkPermission('project:delete');
const CAN_VIEW = checkPermission('project:view:all');

router.post(
  '/', 
  CAN_CREATE, 
  validateRequest(CreateProjectRequestSchema), 
  projectController.createProject
);

router.get(
  '/', 
  CAN_VIEW, 
  validateRequest(GetProjectsRequestSchema),
  projectController.getProjects
);

router.get(
  ENDPOINTS.PROJECTS.BY_PROJECT_ID, 
  CAN_VIEW, 
  projectController.getProjectById
);

router.put(
  ENDPOINTS.PROJECTS.BY_PROJECT_ID, 
  CAN_UPDATE, 
  validateRequest(UpdateProjectRequestSchema), 
  projectController.updateProject
);

router.delete(
  ENDPOINTS.PROJECTS.BY_PROJECT_ID, 
  CAN_DELETE, 
  projectController.deleteProject
);

export default router;
