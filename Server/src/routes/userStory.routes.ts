import { Router } from 'express';
import { container } from '../di/inversify.config';
import { UserStoryController } from '../controller/userStory.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateUserStoryRequestSchema, UpdateUserStoryRequestSchema } from '../dto/userStory.dto';
import { ENDPOINTS } from '../constants/endpoints';

const userStoryController = container.get<UserStoryController>(TYPES.UserStoryController);

export class UserStoryRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.get(ENDPOINTS.USER_STORIES.BY_PROJECT, authMiddleware, checkPermission('userStory:view:all'), userStoryController.getUserStoriesByProject);
    this.router.post(ENDPOINTS.USER_STORIES.ROOT, authMiddleware, checkPermission('userStory:create'), validateRequest(CreateUserStoryRequestSchema), userStoryController.createUserStory);
    this.router.get(ENDPOINTS.USER_STORIES.BY_STORY_ID, authMiddleware, checkPermission('userStory:view:all'), userStoryController.getUserStoryById);
    this.router.put(ENDPOINTS.USER_STORIES.BY_STORY_ID, authMiddleware, checkPermission('userStory:update'), validateRequest(UpdateUserStoryRequestSchema), userStoryController.updateUserStory);
    this.router.delete(ENDPOINTS.USER_STORIES.BY_STORY_ID, authMiddleware, checkPermission('userStory:delete'), userStoryController.deleteUserStory);
  }
}
