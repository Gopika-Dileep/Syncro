import { Router } from 'express';
import { SprintController } from '../controller/sprint.controller';
import { container } from '../di/inversify.config';
import { TYPES } from '../di/types';
import { ENDPOINTS } from '../constants/endpoints';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateSprintRequestSchema, GetSprintRequestSchema, UpdateSprintRequestSchema, SprintIdParamSchema } from '../dto/sprint.dto';

const sprintController = container.get<SprintController>(TYPES.SprintController);

export class SprintRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.post(ENDPOINTS.SPRINTS.ROOT, authMiddleware, checkPermission('sprint:create'), validateRequest(CreateSprintRequestSchema), sprintController.createSprint);
    this.router.get(ENDPOINTS.SPRINTS.ROOT, authMiddleware, checkPermission(['sprint:view:all', 'sprint:create']), validateRequest(GetSprintRequestSchema), sprintController.getSprints);
    this.router.get(ENDPOINTS.SPRINTS.BY_ID, authMiddleware, checkPermission(['sprint:view:all', 'sprint:create']), validateRequest(SprintIdParamSchema), sprintController.getSprintById);
    this.router.patch(ENDPOINTS.SPRINTS.BY_ID, authMiddleware, checkPermission(['sprint:update', 'sprint:start', 'sprint:complete']), validateRequest(UpdateSprintRequestSchema), sprintController.updateSprint);
    this.router.delete(ENDPOINTS.SPRINTS.BY_ID, authMiddleware, checkPermission('sprint:delete'), validateRequest(SprintIdParamSchema), sprintController.deleteSprint);
  }
}
