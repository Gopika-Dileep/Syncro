import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateUserStoryService } from '../interfaces/services/userStory/ICreateUserStoryService';
import { IGetUserStoriesByProjectService } from '../interfaces/services/userStory/IGetUserStoriesByProjectService';
import { IGetUserStoryByIdService } from '../interfaces/services/userStory/IGetUserStoryByIdService';
import { IUpdateUserStoryService } from '../interfaces/services/userStory/IUpdateUserStoryService';
import { IDeleteUserStoryService } from '../interfaces/services/userStory/IDeleteUserStoryService';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { USER_STORY_MESSAGES } from '../constants/messages';

@injectable()
export class UserStoryController {
  constructor(
    @inject(TYPES.CreateUserStoryService) private _createUserStoryService: ICreateUserStoryService,
    @inject(TYPES.GetUserStoriesByProjectService) private _getUserStoriesByProjectService: IGetUserStoriesByProjectService,
    @inject(TYPES.GetUserStoryByIdService) private _getUserStoryByIdService: IGetUserStoryByIdService,
    @inject(TYPES.UpdateUserStoryService) private _updateUserStoryService: IUpdateUserStoryService,
    @inject(TYPES.DeleteUserStoryService) private _deleteUserStoryService: IDeleteUserStoryService,
  ) { }

  createUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const story = await this._createUserStoryService.execute(req.body);
      res.status(HttpStatus.CREATED).json({ success: true, data: story, message: USER_STORY_MESSAGES.CREATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getUserStoriesByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const stories = await this._getUserStoriesByProjectService.execute(projectId as string);
      res.status(HttpStatus.OK).json({ success: true, data: stories });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getUserStoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      const story = await this._getUserStoryByIdService.execute(storyId as string);
      res.status(HttpStatus.OK).json({ success: true, data: story });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      const story = await this._updateUserStoryService.execute(storyId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, data: story, message: USER_STORY_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      await this._deleteUserStoryService.execute(storyId as string);
      res.status(HttpStatus.OK).json({ success: true, message: USER_STORY_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
