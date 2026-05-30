import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IAddEmployeeService } from '../interfaces/services/employee/IAddEmployeeService';
import { IGetEmployeesService } from '../interfaces/services/employee/IGetEmployeesService';
import { IToggleBlockEmployeeService } from '../interfaces/services/employee/IToggleBlockEmployeeService';
import { IGetEmployeeDetailsService } from '../interfaces/services/employee/IGetEmployeeDetailsService';
import { IUpdateEmployeeDetailsService } from '../interfaces/services/employee/IUpdateEmployeeDetailsService';
import { IGetUnassignedEmployeesService } from '../interfaces/services/employee/IGetUnassignedEmployeesService';
import { IAssignTeamToEmployeeService } from '../interfaces/services/employee/IAssignTeamToEmployeeService';
import { EMPLOYEE_MESSAGES } from '../constants/messages';
import { GetEmployeesRequestDTO } from '../dto/employee.dto';
import { TYPES } from '../di/types';
import { success, created } from '../utils/response.utils';

@injectable()
export class EmployeeController {
  constructor(
    @inject(TYPES.IAddEmployeeService) private _addEmployeeService: IAddEmployeeService,
    @inject(TYPES.IGetEmployeesService) private _getEmployeesService: IGetEmployeesService,
    @inject(TYPES.IToggleBlockEmployeeService) private _toggleBlockEmployeeService: IToggleBlockEmployeeService,
    @inject(TYPES.IGetEmployeeDetailsService) private _getEmployeeDetailsService: IGetEmployeeDetailsService,
    @inject(TYPES.IUpdateEmployeeDetailsService) private _updateEmployeeDetailsService: IUpdateEmployeeDetailsService,
    @inject(TYPES.IGetUnassignedEmployeesService) private _getUnassignedEmployeesService: IGetUnassignedEmployeesService,
    @inject(TYPES.IAssignTeamToEmployeeService) private _assignTeamToEmployeeService: IAssignTeamToEmployeeService,
  ) {}

  getUnassignedEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search } = req.query;
      const result = await this._getUnassignedEmployeesService.execute(req.userId!, search as string);
      success(res, result);
    } catch (error) {
      next(error);
    }
  };

  assignTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { employeeId } = req.params;
      const { teamId } = req.body;
      const result = await this._assignTeamToEmployeeService.execute(req.userId!, employeeId as string, teamId);
      success(res, result);
    } catch (error) {
      next(error);
    }
  };

  addEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._addEmployeeService.execute(req.userId!, req.body);
      created(res, result.message);
    } catch (error) {
      next(error);
    }
  };

  getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetEmployeesRequestDTO;
      const { employees, total } = await this._getEmployeesService.execute(req.userId!, query);
      success(res, { employees, total, page: query.page, limit: query.limit });
    } catch (error) {
      next(error);
    }
  };

  toggleBlockEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isBlocked = await this._toggleBlockEmployeeService.execute(req.userId!, req.params.userId as string);
      success(res, { isBlocked }, EMPLOYEE_MESSAGES.TOGGLE_BLOCK_SUCCESS(isBlocked));
    } catch (error) {
      next(error);
    }
  };

  getEmployeeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._getEmployeeDetailsService.execute(req.params.userId as string);
      success(res, result);
    } catch (error) {
      next(error);
    }
  };

  updateEmployeeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._updateEmployeeDetailsService.execute(req.params.userId as string, req.body);
      success(res, result, EMPLOYEE_MESSAGES.UPDATE_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}
