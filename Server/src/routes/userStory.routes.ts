import { Router } from 'express';
import { container } from '../di/inversify.config';
import { UserStoryController } from '../controller/userStory.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateUserStoryRequestSchema, UpdateUserStoryRequestSchema } from '../dto/userStory.dto';

const router = Router();
const userStoryController = container.get<UserStoryController>(TYPES.UserStoryController);

router.use(authMiddleware);

// Get User Stories for a Project
router.get(
  '/project/:projectId',
  (req, res, next) => {
    if (req.userRole === 'company' || req.permissions?.includes('project:view:all') || req.permissions?.includes('project:create') || req.permissions?.includes('userStory:create') || req.permissions?.includes('userStory:view:all')) {
      return next();
    }
    return checkPermission('project:view:all')(req, res, next);
  },
  userStoryController.getUserStoriesByProject,
);

// Create User Story
router.post(
  '/',
  checkPermission('userStory:create'),
  validateRequest(CreateUserStoryRequestSchema),
  userStoryController.createUserStory,
);

// Get specific User Story
router.get(
  '/:storyId',
  (req, res, next) => {
    if (req.userRole === 'company' || req.permissions?.includes('project:view:all') || req.permissions?.includes('project:create') || req.permissions?.includes('userStory:create') || req.permissions?.includes('userStory:view:all')) {
      return next();
    }
    return checkPermission('project:view:all')(req, res, next);
  },
  userStoryController.getUserStoryById,
);

// Update User Story
router.put(
  '/:storyId',
  (req, res, next) => {
    if (req.userRole === 'company' || req.permissions?.includes('userStory:update') || req.permissions?.includes('userStory:update:all')) {
      return next();
    }
    return checkPermission('userStory:update')(req, res, next);
  },
  validateRequest(UpdateUserStoryRequestSchema),
  userStoryController.updateUserStory,
);

// Delete User Story
router.delete(
  '/:storyId',
  (req, res, next) => {
    if (req.userRole === 'company' || req.permissions?.includes('userStory:delete') || req.permissions?.includes('userStory:delete:all')) {
      return next();
    }
    return checkPermission('userStory:delete')(req, res, next);
  },
  userStoryController.deleteUserStory,
);

export default router;
