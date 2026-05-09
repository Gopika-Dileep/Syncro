import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateIssueService } from '../interfaces/services/issue/ICreateIssueService';
import { IGetIssuesByProjectService } from '../interfaces/services/issue/IGetIssuesByProjectService';
import { IGetIssuesBySprintService } from '../interfaces/services/issue/IGetIssuesBySprintService';
import { IGetIssueByIdService } from '../interfaces/services/issue/IGetIssueByIdService';
import { IUpdateIssueService } from '../interfaces/services/issue/IUpdateIssueService';
import { IDeleteIssueService } from '../interfaces/services/issue/IDeleteIssueService';
import { IAssignIssueService } from '../interfaces/services/issue/IAssignIssueService';
import { IAddCommentToIssueService } from '../interfaces/services/issue/IAddCommentToIssueService';
import { IGetAssignedIssuesService } from '../interfaces/services/issue/IGetAssignedIssuesService';
import { IGetTeamIssuesService } from '../interfaces/services/issue/IGetTeamIssuesService';
import { IAddAttachmentToIssueService } from '../interfaces/services/issue/IAddAttachmentToIssueService';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { success, created } from '../utils/response.utils';
import { ISSUE_MESSAGES } from '../constants/messages';
import { IssueMapper } from '../mappers/issue.mapper';

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
    @inject(TYPES.IAddCommentToIssueService) private _addCommentToIssueService: IAddCommentToIssueService,
    @inject(TYPES.IGetAssignedIssuesService) private _getAssignedIssuesService: IGetAssignedIssuesService,
    @inject(TYPES.IGetTeamIssuesService) private _getTeamIssuesService: IGetTeamIssuesService,
    @inject(TYPES.IAddAttachmentToIssueService) private _addAttachmentToIssueService: IAddAttachmentToIssueService,
  ) {}

  createIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const issue = await this._createIssueService.execute(req.body, userId);
      created(res, issue, ISSUE_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getIssuesByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const issues = await this._getIssuesByProjectService.execute(projectId as string);
      success(res, issues);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getIssuesBySprint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sprintId } = req.params;
      const issues = await this._getIssuesBySprintService.execute(sprintId as string);
      success(res, issues);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getIssueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const issue = await this._getIssueByIdService.execute(issueId as string);
      success(res, issue);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const userId = req.userId!;
      const issue = await this._updateIssueService.execute(issueId as string, req.body, userId);
      success(res, issue, ISSUE_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  assignIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { issueId } = req.params;
      const data = { ...req.body, issue_id: issueId };
      const issue = await this._assignIssueService.execute(data, userId);
      success(res, issue, 'Assignment updated successfully');
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      await this._deleteIssueService.execute(issueId as string);
      success(res, ISSUE_MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { text, attachments } = req.body;
      const userId = req.userId!;
      const issue = await this._addCommentToIssueService.execute(issueId as string, userId, text, attachments);
      const mapped = IssueMapper.toResponseDTO(issue);
      success(res, mapped, 'Comment added successfully');
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  addAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { attachments } = req.body;
      const userId = req.userId!;
      const issue = await this._addAttachmentToIssueService.execute(issueId as string, userId, attachments);
      const mapped = IssueMapper.toResponseDTO(issue);
      success(res, mapped, 'Attachments added successfully');
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getAssignedIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const issues = await this._getAssignedIssuesService.execute(userId);
      success(res, issues);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeamIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const issues = await this._getTeamIssuesService.execute(userId);
      success(res, issues);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
