import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateProjectService } from '../interfaces/services/project/ICreateProjectService';
import { IGetProjectsService } from '../interfaces/services/project/IGetProjectsService';
import { IGetProjectByIdService } from '../interfaces/services/project/IGetProjectByIdService';
import { IUpdateProjectService } from '../interfaces/services/project/IUpdateProjectService';
import { IDeleteProjectService } from '../interfaces/services/project/IDeleteProjectService';
import { IGetProjectInsightsService } from '../interfaces/services/project/IGetProjectInsightsService';
import { TYPES } from '../di/types';
import { success, created } from '../utils/response.utils';
import { PROJECT_MESSAGES } from '../constants/messages';
import { GetProjectsRequestDTO } from '../dto/project.dto';

@injectable()
export class ProjectController {
  constructor(
    @inject(TYPES.ICreateProjectService) private _createProjectService: ICreateProjectService,
    @inject(TYPES.IGetProjectsService) private _getProjectsService: IGetProjectsService,
    @inject(TYPES.IGetProjectByIdService) private _getProjectByIdService: IGetProjectByIdService,
    @inject(TYPES.IUpdateProjectService) private _updateProjectService: IUpdateProjectService,
    @inject(TYPES.IDeleteProjectService) private _deleteProjectService: IDeleteProjectService,
    @inject(TYPES.IGetProjectInsightsService) private _getProjectInsightsService: IGetProjectInsightsService,
  ) {}

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._createProjectService.execute(req.userId!, req.body);
      created(res, result.project, result.message);
    } catch (error) {
      next(error);
    }
  };

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetProjectsRequestDTO;
      const { projects, total } = await this._getProjectsService.execute(req.userId!, query);
      success(res, { projects, total, page: query.page, limit: query.limit }, PROJECT_MESSAGES.FETCH_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = await this._updateProjectService.execute(projectId as string, req.body, req.userId!);
      success(res, project, PROJECT_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      await this._deleteProjectService.execute(projectId as string);
      success(res, PROJECT_MESSAGES.DELETE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = await this._getProjectByIdService.execute(projectId as string);
      success(res, project, PROJECT_MESSAGES.FETCH_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  getProjectInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const insights = await this._getProjectInsightsService.execute(projectId as string);
      success(res, insights, PROJECT_MESSAGES.FETCH_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
