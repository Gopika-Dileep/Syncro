import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { ITeamService } from '../interfaces/services/ITeamService';
import { HttpStatus } from '../enums/HttpStatus';
import { TEAM_MESSAGES } from '../constants/messages';
import { TYPES } from '../di/types';

@injectable()
export class TeamController {
  constructor(@inject(TYPES.TeamService) private _teamService: ITeamService) { }

  createTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: TEAM_MESSAGES.CREATE_FAILED });
        return;
      }
      const team = await this._teamService.createTeam(req.body.name, userId);
      res.status(HttpStatus.CREATED).json({ success: true, data: team, message: TEAM_MESSAGES.CREATE_SUCCESS });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : TEAM_MESSAGES.CREATE_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  getTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = req.userId;
      if (!companyId) throw new Error(TEAM_MESSAGES.FETCH_FAILED);
      const teams = await this._teamService.getTeams(companyId);
      res.status(HttpStatus.OK).json({ success: true, data: teams });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : TEAM_MESSAGES.FETCH_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };
}
