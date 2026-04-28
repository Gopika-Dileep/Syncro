import { Router } from 'express';
import { container } from '../di/inversify.config';
import { IssueController } from '../controller/issue.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { CreateIssueRequestSchema, UpdateIssueRequestSchema, AssignIssueRequestSchema } from '../dto/issue.dto';
import { ENDPOINTS } from '../constants/endpoints';

const issueController = container.get<IssueController>(TYPES.IssueController);

export class IssueRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.get(ENDPOINTS.ISSUES.BY_PROJECT, authMiddleware, checkPermission('issue:view:all'), issueController.getIssuesByProject);
    this.router.get(ENDPOINTS.ISSUES.BY_SPRINT, authMiddleware, checkPermission('issue:view:all'), issueController.getIssuesBySprint);
    this.router.post(ENDPOINTS.ISSUES.ROOT, authMiddleware, checkPermission('issue:create'), validateRequest(CreateIssueRequestSchema), issueController.createIssue);
    this.router.get(ENDPOINTS.ISSUES.BY_ISSUE_ID, authMiddleware, checkPermission('issue:view:all'), issueController.getIssueById);
    this.router.put(ENDPOINTS.ISSUES.BY_ISSUE_ID, authMiddleware, checkPermission('issue:update'), validateRequest(UpdateIssueRequestSchema), issueController.updateIssue);
    this.router.patch(ENDPOINTS.ISSUES.ASSIGN, authMiddleware, checkPermission('issue:assignEmployee'), validateRequest(AssignIssueRequestSchema), issueController.assignIssue);
    this.router.delete(ENDPOINTS.ISSUES.BY_ISSUE_ID, authMiddleware, checkPermission('issue:delete'), issueController.deleteIssue);
  }
}
