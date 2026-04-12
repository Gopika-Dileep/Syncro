import { Router } from 'express';
import { container } from '../di/inversify.config';
import { ProjectController } from '../controller/project.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateProjectRequestSchema, UpdateProjectRequestSchema } from '../dto/project.dto';

const router = Router();
const projectController = container.get<ProjectController>(TYPES.ProjectController);

router.use(authMiddleware);

router.post('/', checkPermission('project:create'), validateRequest(CreateProjectRequestSchema), projectController.createProject);
router.get(
  '/',
  (req, res, next) => {
    if (req.permissions?.includes('project:view:all') || req.permissions?.includes('project:create')) {
      return next();
    }
    return checkPermission('project:view:all')(req, res, next);
  },
  projectController.getProjects,
); // Note: Simplified view check
router.get(
  '/:projectId',
  (req, res, next) => {
    if (req.permissions?.includes('project:view:all') || req.permissions?.includes('project:create')) {
      return next();
    }
    return checkPermission('project:view:all')(req, res, next);
  },
  projectController.getProjectById,
);
router.put('/:projectId', checkPermission('project:update'), validateRequest(UpdateProjectRequestSchema), projectController.updateProject);
router.delete('/:projectId', checkPermission('project:delete'), projectController.deleteProject);

export default router;
