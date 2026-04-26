import { Router } from 'express';
import { container } from '../di/inversify.config';
import { TaskController } from '../controller/task.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateTaskRequestSchema, UpdateTaskRequestSchema, AssignTaskRequestSchema } from '../dto/task.dto';
import { ENDPOINTS } from '../constants/endpoints';

const taskController = container.get<TaskController>(TYPES.TaskController);

export class TaskRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    // Get tasks assigned to current user (Developer & Lead "My Tasks")
    this.router.get(
      ENDPOINTS.TASKS.ASSIGNED,
      authMiddleware,
      checkPermission(['task:view:assigned', 'task:view:team']),
      taskController.getAssignedTasks
    );

    // Get all tasks for the Lead's team (Team Lead Kanban)
    this.router.get(
      '/team',
      authMiddleware,
      checkPermission('task:view:team'),
      taskController.getTeamTasks
    );

    // Get all tasks for the company (PM Kanban)
    this.router.get(
      '/all',
      authMiddleware,
      checkPermission('task:view:all'),
      taskController.getAllTasks
    );

    // Get tasks for a user story (PM, Lead, Dev all need this for sprint details)
    this.router.get(
      ENDPOINTS.TASKS.BY_STORY,
      authMiddleware,
      checkPermission(['task:view:all', 'task:view:team', 'task:view:assigned', 'task:create']),
      taskController.getTasksByUserStory
    );

    // Get a single task by ID
    this.router.get(
      ENDPOINTS.TASKS.BY_ID,
      authMiddleware,
      checkPermission(['task:view:all', 'task:view:team', 'task:view:assigned']),
      taskController.getTaskById
    );

    // Create a new task (Lead only)
    this.router.post(
      ENDPOINTS.TASKS.ROOT,
      authMiddleware,
      checkPermission('task:create'),
      validateRequest(CreateTaskRequestSchema),
      taskController.createTask
    );

    // Update a task — covers edit details, start, submit, review
    this.router.put(
      ENDPOINTS.TASKS.BY_ID,
      authMiddleware,
      checkPermission(['task:update', 'task:start', 'task:submit', 'task:review']),
      validateRequest(UpdateTaskRequestSchema),
      taskController.updateTask
    );

    // Delete a task (Lead only)
    this.router.delete(
      ENDPOINTS.TASKS.BY_ID,
      authMiddleware,
      checkPermission('task:delete'),
      taskController.deleteTask
    );

    // Assign a task (Lead only)
    this.router.patch(
      ENDPOINTS.TASKS.ASSIGN,
      authMiddleware,
      checkPermission('task:assign'),
      validateRequest(AssignTaskRequestSchema),
      taskController.assignTask
    );
  }
}
