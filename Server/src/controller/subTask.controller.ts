import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateSubTaskService } from '../interfaces/services/subTask/ICreateSubTaskService';
import { IUpdateSubTaskService } from '../interfaces/services/subTask/IUpdateSubTaskService';
import { IDeleteSubTaskService } from '../interfaces/services/subTask/IDeleteSubTaskService';
import { IGetSubTaskByIdService } from '../interfaces/services/subTask/IGetSubTaskByIdService';
import { IGetSubTasksByIssueService } from '../interfaces/services/subTask/IGetSubTasksByIssueService';
import { IAssignSubTaskService } from '../interfaces/services/subTask/IAssignSubTaskService';
import { IGetAssignedSubTasksService } from '../interfaces/services/subTask/IGetAssignedSubTasksService';
import { IGetTeamSubTasksService } from '../interfaces/services/subTask/IGetTeamSubTasksService';
import { IGetAllSubTasksService } from '../interfaces/services/subTask/IGetAllSubTasksService';
import { IStartSubTaskService } from '../interfaces/services/subTask/IStartSubTaskService';
import { ISubmitSubTaskService } from '../interfaces/services/subTask/ISubmitSubTaskService';
import { IReviewSubTaskService } from '../interfaces/services/subTask/IReviewSubTaskService';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { SUBTASK_MESSAGES } from '../constants/messages';

@injectable()
export class SubTaskController {
  constructor(
    @inject(TYPES.ICreateSubTaskService) private _createSubTaskService: ICreateSubTaskService,
    @inject(TYPES.IUpdateSubTaskService) private _updateSubTaskService: IUpdateSubTaskService,
    @inject(TYPES.IDeleteSubTaskService) private _deleteSubTaskService: IDeleteSubTaskService,
    @inject(TYPES.IGetSubTaskByIdService) private _getSubTaskByIdService: IGetSubTaskByIdService,
    @inject(TYPES.IGetSubTasksByIssueService) private _getSubTasksByIssueService: IGetSubTasksByIssueService,
    @inject(TYPES.IAssignSubTaskService) private _assignSubTaskService: IAssignSubTaskService,
    @inject(TYPES.IGetAssignedSubTasksService) private _getAssignedSubTasksService: IGetAssignedSubTasksService,
    @inject(TYPES.IGetTeamSubTasksService) private _getTeamSubTasksService: IGetTeamSubTasksService,
    @inject(TYPES.IGetAllSubTasksService) private _getAllSubTasksService: IGetAllSubTasksService,
    @inject(TYPES.IStartSubTaskService) private _startSubTaskService: IStartSubTaskService,
    @inject(TYPES.ISubmitSubTaskService) private _submitSubTaskService: ISubmitSubTaskService,
    @inject(TYPES.IReviewSubTaskService) private _reviewSubTaskService: IReviewSubTaskService,
  ) {}

  createSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const subTask = await this._createSubTaskService.execute(req.body, userId);
      res.status(HttpStatus.CREATED).json({ success: true, data: subTask, message: SUBTASK_MESSAGES.CREATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._updateSubTaskService.execute(subTaskId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTask, message: SUBTASK_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      await this._deleteSubTaskService.execute(subTaskId as string);
      res.status(HttpStatus.OK).json({ success: true, message: SUBTASK_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getSubTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const subTask = await this._getSubTaskByIdService.execute(subTaskId as string);
      res.status(HttpStatus.OK).json({ success: true, data: subTask });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getSubTasksByIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const subTasks = await this._getSubTasksByIssueService.execute(issueId as string);
      res.status(HttpStatus.OK).json({ success: true, data: subTasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  assignSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._assignSubTaskService.execute(subTaskId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTask, message: SUBTASK_MESSAGES.ASSIGN_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  startSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._startSubTaskService.execute(subTaskId as string, userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTask, message: 'Task started successfully' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  submitSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._submitSubTaskService.execute(subTaskId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTask, message: 'Task submitted for review' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  reviewSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._reviewSubTaskService.execute(subTaskId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTask, message: 'Review completed' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getAssignedSubTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const subTasks = await this._getAssignedSubTasksService.execute(userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeamSubTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const subTasks = await this._getTeamSubTasksService.execute(userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getAllSubTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const subTasks = await this._getAllSubTasksService.execute(userId);
      res.status(HttpStatus.OK).json({ success: true, data: subTasks });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
