import { Router } from 'express';
import { container } from '../di/inversify.config';
import { SubTaskController } from '../controller/subTask.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateSubTaskRequestSchema, UpdateSubTaskRequestSchema, AssignSubTaskRequestSchema, SubmitSubTaskRequestSchema, ReviewSubTaskRequestSchema } from '../dto/subTask.dto';
import { ENDPOINTS } from '../constants/endpoints';

const subTaskController = container.get<SubTaskController>(TYPES.SubTaskController);

export class SubTaskRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.get(ENDPOINTS.SUBTASKS.ASSIGNED, authMiddleware, checkPermission(['task:view:assigned', 'task:view:team']), subTaskController.getAssignedSubTasks);
    this.router.get(ENDPOINTS.SUBTASKS.TEAM, authMiddleware, checkPermission('task:view:team'), subTaskController.getTeamSubTasks);
    this.router.get(ENDPOINTS.SUBTASKS.ALL, authMiddleware, checkPermission('task:view:all'), subTaskController.getAllSubTasks);
    this.router.get(ENDPOINTS.SUBTASKS.BY_ISSUE, authMiddleware, checkPermission(['task:view:all', 'task:view:team', 'task:view:assigned', 'task:create']), subTaskController.getSubTasksByIssue);
    this.router.get(ENDPOINTS.SUBTASKS.BY_ID, authMiddleware, checkPermission(['task:view:all', 'task:view:team', 'task:view:assigned']), subTaskController.getSubTaskById);
    this.router.post(ENDPOINTS.SUBTASKS.ROOT, authMiddleware, checkPermission('task:create'), validateRequest(CreateSubTaskRequestSchema), subTaskController.createSubTask);
    this.router.put(ENDPOINTS.SUBTASKS.BY_ID, authMiddleware, checkPermission('task:update'), validateRequest(UpdateSubTaskRequestSchema), subTaskController.updateSubTask);
    this.router.patch(ENDPOINTS.SUBTASKS.START, authMiddleware, checkPermission('task:status:work'), subTaskController.startSubTask);
    this.router.patch(ENDPOINTS.SUBTASKS.SUBMIT, authMiddleware, checkPermission('task:status:work'), validateRequest(SubmitSubTaskRequestSchema), subTaskController.submitSubTask);
    this.router.patch(ENDPOINTS.SUBTASKS.REVIEW, authMiddleware, checkPermission('task:status:review'), validateRequest(ReviewSubTaskRequestSchema), subTaskController.reviewSubTask);
    this.router.delete(ENDPOINTS.SUBTASKS.BY_ID, authMiddleware, checkPermission('task:delete'), subTaskController.deleteSubTask);
    this.router.patch(ENDPOINTS.SUBTASKS.ASSIGN, authMiddleware, checkPermission('task:assign'), validateRequest(AssignSubTaskRequestSchema), subTaskController.assignSubTask);
    this.router.post(ENDPOINTS.SUBTASKS.COMMENT, authMiddleware, subTaskController.addComment);
  }
}
