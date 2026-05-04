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
    this.router.get(ENDPOINTS.ISSUES.BY_PROJECT, authMiddleware, checkPermission(['issue:story:view', 'issue:task:view', 'issue:bug:view']), issueController.getIssuesByProject);
    this.router.get(ENDPOINTS.ISSUES.BY_SPRINT, authMiddleware, checkPermission(['issue:story:view', 'issue:task:view', 'issue:bug:view']), issueController.getIssuesBySprint);
    this.router.post(ENDPOINTS.ISSUES.ROOT, authMiddleware, checkPermission(['issue:story:create', 'issue:task:create', 'issue:bug:create']), validateRequest(CreateIssueRequestSchema), issueController.createIssue);
    this.router.get(ENDPOINTS.ISSUES.BY_ISSUE_ID, authMiddleware, checkPermission(['issue:story:view', 'issue:task:view', 'issue:bug:view']), issueController.getIssueById);
    this.router.get(ENDPOINTS.ISSUES.ASSIGNED, authMiddleware, issueController.getAssignedIssues);
    this.router.get(ENDPOINTS.ISSUES.TEAM, authMiddleware, issueController.getTeamIssues);
    this.router.put(ENDPOINTS.ISSUES.BY_ISSUE_ID, authMiddleware, checkPermission(['issue:story:update', 'issue:task:update', 'issue:bug:update']), validateRequest(UpdateIssueRequestSchema), issueController.updateIssue);
    this.router.patch(
      ENDPOINTS.ISSUES.ASSIGN,
      authMiddleware,
      checkPermission(['issue:story:assign', 'issue:task:assign', 'issue:bug:assign', 'issue:story:assign_to_sprint', 'issue:task:assign_to_sprint', 'issue:bug:assign_to_sprint']),
      validateRequest(AssignIssueRequestSchema),
      issueController.assignIssue,
    );
    this.router.post(ENDPOINTS.ISSUES.COMMENT, authMiddleware, issueController.addComment);
    this.router.delete(ENDPOINTS.ISSUES.BY_ISSUE_ID, authMiddleware, checkPermission(['issue:story:delete', 'issue:task:delete', 'issue:bug:delete']), issueController.deleteIssue);
  }
}
