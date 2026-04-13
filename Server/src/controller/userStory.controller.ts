import { injectable, inject } from 'inversify';
import { IUserStoryService } from '../interfaces/services/IUserStoryService';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { USER_STORY_MESSAGES } from '../constants/messages';

@injectable()
export class UserStoryController {
  constructor(@inject(TYPES.UserStoryService) private _userStoryService: IUserStoryService) { }

  createUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const story = await this._userStoryService.createUserStory(req.body);
      res.status(HttpStatus.CREATED).json({ success: true, data: story, message: USER_STORY_MESSAGES.CREATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getUserStoriesByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const stories = await this._userStoryService.getUserStoriesByProject(projectId as string);
      res.status(HttpStatus.OK).json({ success: true, data: stories });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getUserStoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      const story = await this._userStoryService.getUserStoryById(storyId as string);
      res.status(HttpStatus.OK).json({ success: true, data: story });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      const story = await this._userStoryService.updateUserStory(storyId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, data: story, message: USER_STORY_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      await this._userStoryService.deleteUserStory(storyId as string);
      res.status(HttpStatus.OK).json({ success: true, message: USER_STORY_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
