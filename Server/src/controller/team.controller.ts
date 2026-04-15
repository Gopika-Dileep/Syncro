import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateTeamService } from '../interfaces/services/team/ICreateTeamService';
import { IGetTeamsService } from '../interfaces/services/team/IGetTeamsService';
import { IUpdateTeamService } from '../interfaces/services/team/IUpdateTeamService';
import { IDeleteTeamService } from '../interfaces/services/team/IDeleteTeamService';
import { IGetTeamDirectoryService } from '../interfaces/services/team/IGetTeamDirectoryService';
import { HttpStatus } from '../enums/HttpStatus';
import { TEAM_MESSAGES } from '../constants/messages';
import { GetTeamsRequestDTO, GetTeamDirectoryRequestDTO } from '../dto/team.dto';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
import { UnauthorizedError } from '../errors/AppError';

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
      const userId = req.userId;
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: TEAM_MESSAGES.CREATE_FAILED });
        return;
      }
      const team = await this._createTeamService.execute(req.body.name, userId);
      res.status(HttpStatus.CREATED).json({ success: true, data: team, message: TEAM_MESSAGES.CREATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) throw new UnauthorizedError(TEAM_MESSAGES.FETCH_FAILED);
      const query = req.query as unknown as GetTeamsRequestDTO;
      const { teams, total } = await this._getTeamsService.execute(userId, query);
      res.status(HttpStatus.OK).json({ success: true, data: teams, total, page: query.page, limit: query.limit });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { teamId } = req.params;
      const { name } = req.body;
      const team = await this._updateTeamService.execute(teamId as string, name);
      res.status(HttpStatus.OK).json({ success: true, data: team, message: TEAM_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { teamId } = req.params;
      await this._deleteTeamService.execute(teamId as string);
      res.status(HttpStatus.OK).json({ success: true, message: TEAM_MESSAGES.DELETE_SUCCESS });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getTeamDirectory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetTeamDirectoryRequestDTO;
      const directory = await this._getTeamDirectoryService.execute(req.userId!, req.permissions || [], query);
      res.status(HttpStatus.OK).json({
        success: true,
        data: directory,
        message: TEAM_MESSAGES.FETCH_SUCCESS,
      });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
