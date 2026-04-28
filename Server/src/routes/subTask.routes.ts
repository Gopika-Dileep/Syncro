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
    // Get tasks assigned to current user (Developer & Lead "My Tasks")
    this.router.get(
      ENDPOINTS.SUBTASKS.ASSIGNED,
      authMiddleware,
      checkPermission(['task:view:assigned', 'task:view:team']),
      subTaskController.getAssignedSubTasks
    );

    // Get all tasks for the Lead's team (Team Lead Kanban)
    this.router.get(
      '/team',
      authMiddleware,
      checkPermission('task:view:team'),
      subTaskController.getTeamSubTasks
    );

    // Get all tasks for the company (PM Kanban)
    this.router.get(
      '/all',
      authMiddleware,
      checkPermission('task:view:all'),
      subTaskController.getAllSubTasks
    );

    // Get tasks for an issue (PM, Lead, Dev all need this for sprint details)
    this.router.get(
      ENDPOINTS.SUBTASKS.BY_ISSUE,
      authMiddleware,
      checkPermission(['task:view:all', 'task:view:team', 'task:view:assigned', 'task:create']),
      subTaskController.getSubTasksByIssue
    );

    // Get a single sub-task by ID
    this.router.get(
      ENDPOINTS.SUBTASKS.BY_ID,
      authMiddleware,
      checkPermission(['task:view:all', 'task:view:team', 'task:view:assigned']),
      subTaskController.getSubTaskById
    );

    // Create a new sub-task (Lead only)
    this.router.post(
      ENDPOINTS.SUBTASKS.ROOT,
      authMiddleware,
      checkPermission('task:create'),
      validateRequest(CreateSubTaskRequestSchema),
      subTaskController.createSubTask
    );

    // Update a sub-task basic details
    this.router.put(
      ENDPOINTS.SUBTASKS.BY_ID,
      authMiddleware,
      checkPermission('task:update'),
      validateRequest(UpdateSubTaskRequestSchema),
      subTaskController.updateSubTask
    );

    // Start a sub-task
    this.router.patch(
      '/start/:subTaskId',
      authMiddleware,
      checkPermission('task:start'),
      subTaskController.startSubTask
    );

    // Submit a sub-task
    this.router.patch(
      '/submit/:subTaskId',
      authMiddleware,
      checkPermission('task:submit'),
      validateRequest(SubmitSubTaskRequestSchema),
      subTaskController.submitSubTask
    );

    // Review a sub-task
    this.router.patch(
      '/review/:subTaskId',
      authMiddleware,
      checkPermission('task:review'),
      validateRequest(ReviewSubTaskRequestSchema),
      subTaskController.reviewSubTask
    );

    // Delete a sub-task (Lead only)
    this.router.delete(
      ENDPOINTS.SUBTASKS.BY_ID,
      authMiddleware,
      checkPermission('task:delete'),
      subTaskController.deleteSubTask
    );

    // Assign a sub-task (Lead only)
    this.router.patch(
      ENDPOINTS.SUBTASKS.ASSIGN,
      authMiddleware,
      checkPermission('task:assign'),
      validateRequest(AssignSubTaskRequestSchema),
      subTaskController.assignSubTask
    );
  }
}
