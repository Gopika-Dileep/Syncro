import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { ICreateProjectService } from '../interfaces/services/project/ICreateProjectService';
import { IGetProjectsService } from '../interfaces/services/project/IGetProjectsService';
import { IGetProjectByIdService } from '../interfaces/services/project/IGetProjectByIdService';
import { IUpdateProjectService } from '../interfaces/services/project/IUpdateProjectService';
import { IDeleteProjectService } from '../interfaces/services/project/IDeleteProjectService';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
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
  ) {}

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._createProjectService.execute(req.userId!, req.body);
      res.status(HttpStatus.CREATED).json({ 
        success: true, 
        data: result.project, 
        message: result.message 
      });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetProjectsRequestDTO;
      const { projects, total } = await this._getProjectsService.execute(req.userId!, query);
      res.status(HttpStatus.OK).json({ 
        success: true, 
        data: projects, 
        total, 
        page: query.page, 
        limit: query.limit,
        message: PROJECT_MESSAGES.FETCH_SUCCESS 
      });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = await this._updateProjectService.execute(projectId as string, req.body);
      res.status(HttpStatus.OK).json({ 
        success: true, 
        data: project, 
        message: PROJECT_MESSAGES.UPDATE_SUCCESS 
      });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      await this._deleteProjectService.execute(projectId as string);
      res.status(HttpStatus.OK).json({ 
        success: true, 
        message: PROJECT_MESSAGES.DELETE_SUCCESS 
      });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = await this._getProjectByIdService.execute(projectId as string);
      res.status(HttpStatus.OK).json({ 
        success: true, 
        data: project, 
        message: PROJECT_MESSAGES.FETCH_SUCCESS 
      });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
