import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { ICreateSprintService } from '../interfaces/services/sprint/ICreateSprintService';
import { IGetSprintsService } from '../interfaces/services/sprint/IGetSprintsService';
import { IUpdateSprintService } from '../interfaces/services/sprint/IUpdateSprintService';
import { IDeleteSprintService } from '../interfaces/services/sprint/IDeleteSprintService';
import { IGetSprintByIdService } from '../interfaces/services/sprint/IGetSprintByIdService';
import { HttpStatus } from '../enums/HttpStatus';
import { GetSprintRequestDTO } from '../dto/sprint.dto';

@injectable()
export class SprintController {
  constructor(
    @inject(TYPES.ICreateSprintService) private _createSprintService: ICreateSprintService,
    @inject(TYPES.IGetSprintsService) private _getSprintsService: IGetSprintsService,
    @inject(TYPES.IUpdateSprintService) private _updateSprintService: IUpdateSprintService,
    @inject(TYPES.IDeleteSprintService) private _deleteSprintService: IDeleteSprintService,
    @inject(TYPES.IGetSprintByIdService) private _getSprintByIdService: IGetSprintByIdService,
  ) {}

  createSprint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const result = await this._createSprintService.execute(userId, req.body);
      res.status(HttpStatus.CREATED).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getSprints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const query = req.query as unknown as GetSprintRequestDTO;
      const result = await this._getSprintsService.execute(userId, query);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  getSprintById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sprintId } = req.params;
      const result = await this._getSprintByIdService.execute(sprintId as string);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  updateSprint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sprintId } = req.params;
      const result = await this._updateSprintService.execute(sprintId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  deleteSprint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sprintId } = req.params;
      const result = await this._deleteSprintService.execute(sprintId as string);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}