import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateIssueService } from '../interfaces/services/issue/ICreateIssueService';
import { IGetIssuesByProjectService } from '../interfaces/services/issue/IGetIssuesByProjectService';
import { IGetIssuesBySprintService } from '../interfaces/services/issue/IGetIssuesBySprintService';
import { IGetIssueByIdService } from '../interfaces/services/issue/IGetIssueByIdService';
import { IUpdateIssueService } from '../interfaces/services/issue/IUpdateIssueService';
import { IDeleteIssueService } from '../interfaces/services/issue/IDeleteIssueService';
import { IAssignIssueService } from '../interfaces/services/issue/IAssignIssueService';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { ISSUE_MESSAGES } from '../constants/messages';

@injectable()
export class IssueController {
  constructor(
    @inject(TYPES.ICreateIssueService) private _createIssueService: ICreateIssueService,
    @inject(TYPES.IGetIssuesByProjectService) private _getIssuesByProjectService: IGetIssuesByProjectService,
    @inject(TYPES.IGetIssuesBySprintService) private _getIssuesBySprintService: IGetIssuesBySprintService,
    @inject(TYPES.IGetIssueByIdService) private _getIssueByIdService: IGetIssueByIdService,
    @inject(TYPES.IUpdateIssueService) private _updateIssueService: IUpdateIssueService,
    @inject(TYPES.IDeleteIssueService) private _deleteIssueService: IDeleteIssueService,
    @inject(TYPES.IAssignIssueService) private _assignIssueService: IAssignIssueService,
  ) { }

  createIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const issue = await this._createIssueService.execute(req.body, userId);
      res.status(HttpStatus.CREATED).json({ success: true, data: issue, message: ISSUE_MESSAGES.CREATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getIssuesByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const issues = await this._getIssuesByProjectService.execute(projectId as string);
      res.status(HttpStatus.OK).json({ success: true, data: issues });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getIssuesBySprint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sprintId } = req.params;
      const issues = await this._getIssuesBySprintService.execute(sprintId as string);
      res.status(HttpStatus.OK).json({ success: true, data: issues });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getIssueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const issue = await this._getIssueByIdService.execute(issueId as string);
      res.status(HttpStatus.OK).json({ success: true, data: issue });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const userId = req.userId!;
      const issue = await this._updateIssueService.execute(issueId as string, req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: issue, message: ISSUE_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  assignIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const issue = await this._assignIssueService.execute(req.body, userId);
      res.status(HttpStatus.OK).json({ success: true, data: issue, message: 'Assignee updated successfully' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      await this._deleteIssueService.execute(issueId as string);
      res.status(HttpStatus.OK).json({ success: true, message: ISSUE_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
