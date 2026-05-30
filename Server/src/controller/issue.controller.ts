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
import { IAddAttachmentToIssueService } from '../interfaces/services/issue/IAddAttachmentToIssueService';
import { IAutoAssignIssueService } from '../interfaces/services/issue/IAutoAssignIssueService';
import { TYPES } from '../di/types';
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
    @inject(TYPES.IAddAttachmentToIssueService) private _addAttachmentToIssueService: IAddAttachmentToIssueService,
    @inject(TYPES.IAutoAssignIssueService) private _autoAssignIssueService: IAutoAssignIssueService,
  ) {}

  createIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const issue = await this._createIssueService.execute(req.body, userId);
      created(res, issue, ISSUE_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getIssuesByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const issues = await this._getIssuesByProjectService.execute(projectId as string);
      success(res, issues);
    } catch (error) {
      next(error);
    }
  };

  getIssuesBySprint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sprintId } = req.params;
      const issues = await this._getIssuesBySprintService.execute(sprintId as string);
      success(res, issues);
    } catch (error) {
      next(error);
    }
  };

  getIssueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const issue = await this._getIssueByIdService.execute(issueId as string);
      success(res, issue);
    } catch (error) {
      next(error);
    }
  };

  updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const userRole = req.userRole;
      const issue = await this._updateIssueService.execute(issueId as string, req.body, userId, permissions, userRole);
      success(res, issue, ISSUE_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  assignIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const permissions = req.permissions || [];
      const userRole = req.userRole;
      const { issueId } = req.params;
      const data = { ...req.body, issue_id: issueId };
      const issue = await this._assignIssueService.execute(data, userId, permissions, userRole);
      success(res, issue, ISSUE_MESSAGES.ASSIGN_UPDATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      await this._deleteIssueService.execute(issueId as string);
      success(res, ISSUE_MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { text, attachments } = req.body;
      const userId = req.userId!;
      const issue = await this._addCommentToIssueService.execute(issueId as string, userId, text, attachments);
      const mapped = IssueMapper.toResponseDTO(issue);
      success(res, mapped, ISSUE_MESSAGES.COMMENT_ADD_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  addAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const { attachments } = req.body;
      const userId = req.userId!;
      const issue = await this._addAttachmentToIssueService.execute(issueId as string, userId, attachments);
      const mapped = IssueMapper.toResponseDTO(issue);
      success(res, mapped, ISSUE_MESSAGES.ATTACHMENT_ADD_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  autoAssignIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { issueId } = req.params;
      const userId = req.userId!;
      const issue = await this._autoAssignIssueService.execute(issueId as string, userId);
      success(res, issue, ISSUE_MESSAGES.AUTO_ASSIGN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
