import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateTeamService } from '../interfaces/services/team/ICreateTeamService';
import { IGetTeamsService } from '../interfaces/services/team/IGetTeamsService';
import { IUpdateTeamService } from '../interfaces/services/team/IUpdateTeamService';
import { IDeleteTeamService } from '../interfaces/services/team/IDeleteTeamService';
import { HttpStatus } from '../enums/HttpStatus';
import { TEAM_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';

@injectable()
export class TeamController {
  constructor(
    @inject(TYPES.CreateTeamService) private _createTeamService: ICreateTeamService,
    @inject(TYPES.GetTeamsService) private _getTeamsService: IGetTeamsService,
    @inject(TYPES.UpdateTeamService) private _updateTeamService: IUpdateTeamService,
    @inject(TYPES.DeleteTeamService) private _deleteTeamService: IDeleteTeamService,
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
      const companyId = req.userId;
      if (!companyId) throw new Error(TEAM_MESSAGES.FETCH_FAILED);
      const teams = await this._getTeamsService.execute(companyId);
      res.status(HttpStatus.OK).json({ success: true, data: teams });
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
}
