import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateSubTaskService } from '../interfaces/services/subTask/ICreateSubTaskService';
import { SubTaskMapper } from '../mappers/subTask.mapper';
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
import { IAddCommentToSubTaskService } from '../interfaces/services/subTask/IAddCommentToSubTaskService';
import { IAddAttachmentToSubTaskService } from '../interfaces/services/subTask/IAddAttachmentToSubTaskService';
import { IAutoAssignSubTaskService } from '../interfaces/services/subTask/IAutoAssignSubTaskService';
import { TYPES } from '../di/types';
import { success, created } from '../utils/response.utils';
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
    @inject(TYPES.IAddCommentToSubTaskService) private _addCommentToSubTaskService: IAddCommentToSubTaskService,
    @inject(TYPES.IAddAttachmentToSubTaskService) private _addAttachmentToSubTaskService: IAddAttachmentToSubTaskService,
    @inject(TYPES.IAutoAssignSubTaskService) private _autoAssignSubTaskService: IAutoAssignSubTaskService,
  ) {}

  createSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const userRole = req.userRole;
      const subTask = await this._createSubTaskService.execute(req.body, userId, permissions, userRole);
      created(res, subTask, SUBTASK_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  updateSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const userRole = req.userRole;
      const subTask = await this._updateSubTaskService.execute(subTaskId as string, req.body, userId, permissions, userRole);
      success(res, subTask, SUBTASK_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  deleteSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      await this._deleteSubTaskService.execute(subTaskId as string);
      success(res, SUBTASK_MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getSubTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const subTask = await this._getSubTaskByIdService.execute(subTaskId as string);
      success(res, subTask);
    } catch (error) {
      next(error);
    }
  };

  getSubTasksByIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const subTasks = await this._getSubTasksByIssueService.execute(issueId as string);
      success(res, subTasks);
    } catch (error) {
      next(error);
    }
  };

  assignSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const userRole = req.userRole;
      const subTask = await this._assignSubTaskService.execute(subTaskId as string, req.body, userId, permissions, userRole);
      success(res, subTask, SUBTASK_MESSAGES.ASSIGN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  autoAssignSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const userRole = req.userRole;
      const subTask = await this._autoAssignSubTaskService.execute(subTaskId as string, userId, permissions, userRole);
      success(res, subTask, SUBTASK_MESSAGES.AUTO_ASSIGN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  startSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._startSubTaskService.execute(subTaskId as string, userId);
      success(res, subTask, SUBTASK_MESSAGES.START_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  submitSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._submitSubTaskService.execute(subTaskId as string, req.body, userId);
      success(res, subTask, SUBTASK_MESSAGES.SUBMIT_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  reviewSubTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const userId = req.userId!;
      const subTask = await this._reviewSubTaskService.execute(subTaskId as string, req.body, userId);
      success(res, subTask, SUBTASK_MESSAGES.REVIEW_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getAssignedSubTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const search = (req.query.search as string) || '';
      const subTasks = await this._getAssignedSubTasksService.execute(userId, search);
      success(res, subTasks);
    } catch (error) {
      next(error);
    }
  };

  getTeamSubTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const search = (req.query.search as string) || '';
      const subTasks = await this._getTeamSubTasksService.execute(userId, search);
      success(res, subTasks);
    } catch (error) {
      next(error);
    }
  };

  getAllSubTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const search = (req.query.search as string) || '';
      const subTasks = await this._getAllSubTasksService.execute(userId, search);
      success(res, subTasks);
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const { text, attachments } = req.body;
      const userId = req.userId!;
      const subTask = await this._addCommentToSubTaskService.execute(subTaskId as string, userId, text, attachments);
      const mapped = SubTaskMapper.toResponseDTO(subTask);
      success(res, mapped, SUBTASK_MESSAGES.COMMENT_ADD_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  addAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { subTaskId } = req.params;
      const { attachments } = req.body;
      const userId = req.userId!;
      const subTask = await this._addAttachmentToSubTaskService.execute(subTaskId as string, userId, attachments);
      const mapped = SubTaskMapper.toResponseDTO(subTask);
      success(res, mapped, SUBTASK_MESSAGES.ATTACHMENT_ADD_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
