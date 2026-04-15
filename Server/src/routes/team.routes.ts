import { Router } from 'express';
import { container } from '../di/inversify.config';
import { TeamController } from '../controller/team.controller';
import { TYPES } from '../di/types';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/permission.middleware';
import { ENDPOINTS } from '../constants/endpoints';
import { validateRequest } from '../middleware/validation.middleware';
import { GetTeamDirectoryRequestSchema } from '../dto/team.dto';

const teamController = container.get<TeamController>(TYPES.TeamController);

export class TeamRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.get(ENDPOINTS.TEAMS.DIRECTORY, authMiddleware, checkPermission(['team:view:team', 'team:view:all']), validateRequest(GetTeamDirectoryRequestSchema), teamController.getTeamDirectory);
  }
}
