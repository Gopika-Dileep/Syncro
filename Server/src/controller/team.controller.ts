import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateTeamService } from '../interfaces/services/team/ICreateTeamService';
import { IGetTeamsService } from '../interfaces/services/team/IGetTeamsService';
import { IUpdateTeamService } from '../interfaces/services/team/IUpdateTeamService';
import { IDeleteTeamService } from '../interfaces/services/team/IDeleteTeamService';
import { IGetTeamDirectoryService } from '../interfaces/services/team/IGetTeamDirectoryService';
import { TEAM_MESSAGES } from '../constants/messages';
import { GetTeamsRequestDTO, GetTeamDirectoryRequestDTO } from '../dto/team.dto';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { success, created } from '../utils/response.utils';

@injectable()
export class TeamController {
  constructor(
    @inject(TYPES.ICreateTeamService) private _createTeamService: ICreateTeamService,
    @inject(TYPES.IGetTeamsService) private _getTeamsService: IGetTeamsService,
    @inject(TYPES.IUpdateTeamService) private _updateTeamService: IUpdateTeamService,
    @inject(TYPES.IDeleteTeamService) private _deleteTeamService: IDeleteTeamService,
    @inject(TYPES.IGetTeamDirectoryService) private _getTeamDirectoryService: IGetTeamDirectoryService,
  ) {}

  createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const team = await this._createTeamService.execute(req.body.name, userId);
      created(res, team, TEAM_MESSAGES.CREATE_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as GetTeamsRequestDTO;
      const { teams, total } = await this._getTeamsService.execute(userId, query);
      success(res, { teams, total, page: query.page, limit: query.limit });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { teamId } = req.params;
      const { name } = req.body;
      const team = await this._updateTeamService.execute(teamId as string, name);
      success(res, team, TEAM_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { teamId } = req.params;
      await this._deleteTeamService.execute(teamId as string);
      success(res, TEAM_MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeamDirectory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetTeamDirectoryRequestDTO;
      const directory = await this._getTeamDirectoryService.execute(req.userId!, req.permissions || [], query);
      success(res, directory, TEAM_MESSAGES.FETCH_SUCCESS);
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
