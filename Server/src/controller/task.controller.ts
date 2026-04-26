import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateTaskService } from '../interfaces/services/task/ICreateTaskService';
import { IUpdateTaskService } from '../interfaces/services/task/IUpdateTaskService';
import { IDeleteTaskService } from '../interfaces/services/task/IDeleteTaskService';
import { IGetTaskByIdService } from '../interfaces/services/task/IGetTaskByIdService';
import { IGetTasksByUserStoryService } from '../interfaces/services/task/IGetTasksByUserStoryService';
import { IAssignTaskService } from '../interfaces/services/task/IAssignTaskService';
import { IGetAssignedTasksService } from '../interfaces/services/task/IGetAssignedTasksService';
import { IGetTeamTasksService } from '../interfaces/services/task/IGetTeamTasksService';
import { IGetAllTasksService } from '../interfaces/services/task/IGetAllTasksService';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { TASK_MESSAGES } from '../constants/messages';

@injectable()
export class TaskController {
  constructor(
    @inject(TYPES.ICreateTaskService) private _createTaskService: ICreateTaskService,
    @inject(TYPES.IUpdateTaskService) private _updateTaskService: IUpdateTaskService,
    @inject(TYPES.IDeleteTaskService) private _deleteTaskService: IDeleteTaskService,
    @inject(TYPES.IGetTaskByIdService) private _getTaskByIdService: IGetTaskByIdService,
    @inject(TYPES.IGetTasksByUserStoryService) private _getTasksByUserStoryService: IGetTasksByUserStoryService,
    @inject(TYPES.IAssignTaskService) private _assignTaskService: IAssignTaskService,
    @inject(TYPES.IGetAssignedTasksService) private _getAssignedTasksService: IGetAssignedTasksService,
    @inject(TYPES.IGetTeamTasksService) private _getTeamTasksService: IGetTeamTasksService,
    @inject(TYPES.IGetAllTasksService) private _getAllTasksService: IGetAllTasksService,
  ) {}

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const task = await this._createTaskService.execute(req.body, userId);
      res.status(HttpStatus.CREATED).json({ success: true, data: task, message: TASK_MESSAGES.CREATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const userId = req.userId!;
      const task = await this._updateTaskService.execute(taskId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: task, message: TASK_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      await this._deleteTaskService.execute(taskId as string);
      res.status(HttpStatus.OK).json({ success: true, message: TASK_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const task = await this._getTaskByIdService.execute(taskId as string);
      res.status(HttpStatus.OK).json({ success: true, data: task });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTasksByUserStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { storyId } = req.params;
      const userId = req.userId!;
      const tasks = await this._getTasksByUserStoryService.execute(userId, storyId as string);
      res.status(HttpStatus.OK).json({ success: true, data: tasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  assignTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { taskId } = req.params;
      const userId = req.userId!;
      const task = await this._assignTaskService.execute(taskId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: task, message: TASK_MESSAGES.ASSIGN_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getAssignedTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const tasks = await this._getAssignedTasksService.execute(userId);
      res.status(HttpStatus.OK).json({ success: true, data: tasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeamTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const tasks = await this._getTeamTasksService.execute(userId);
      res.status(HttpStatus.OK).json({ success: true, data: tasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const tasks = await this._getAllTasksService.execute(userId);
      res.status(HttpStatus.OK).json({ success: true, data: tasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
