import { injectable, inject } from 'inversify';
import { IProjectService } from '../interfaces/services/IProjectService';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';

@injectable()
export class ProjectController {
  constructor(@inject(TYPES.ProjectService) private _projectService: IProjectService) {}

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const project = await this._projectService.createProject(req.userId!, req.body);
      res.status(HttpStatus.CREATED).json({ success: true, data: project, message: 'Project created successfully' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projects = await this._projectService.getProjects(req.userId!);
      res.status(HttpStatus.OK).json({ success: true, data: projects });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = await this._projectService.updateProject(projectId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, data: project, message: 'Project updated successfully' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      await this._projectService.deleteProject(projectId as string);
      res.status(HttpStatus.OK).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const project = await this._projectService.getProjectById(projectId as string);
      res.status(HttpStatus.OK).json({ success: true, data: project });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
