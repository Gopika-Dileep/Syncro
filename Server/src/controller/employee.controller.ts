import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IAddEmployeeService } from '../interfaces/services/employee/IAddEmployeeService';
import { IGetEmployeesService } from '../interfaces/services/employee/IGetEmployeesService';
import { IToggleBlockEmployeeService } from '../interfaces/services/employee/IToggleBlockEmployeeService';
import { IGetEmployeeDetailsService } from '../interfaces/services/employee/IGetEmployeeDetailsService';
import { IUpdateEmployeeDetailsService } from '../interfaces/services/employee/IUpdateEmployeeDetailsService';
import { HttpStatus } from '../enums/HttpStatus';
import { EMPLOYEE_MESSAGES } from '../constants/messages';
import { GetEmployeesRequestDTO } from '../dto/employee.dto';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';

@injectable()
export class EmployeeController {
  constructor(
    @inject(TYPES.AddEmployeeService) private _addEmployeeService: IAddEmployeeService,
    @inject(TYPES.GetEmployeesService) private _getEmployeesService: IGetEmployeesService,
    @inject(TYPES.ToggleBlockEmployeeService) private _toggleBlockEmployeeService: IToggleBlockEmployeeService,
    @inject(TYPES.GetEmployeeDetailsService) private _getEmployeeDetailsService: IGetEmployeeDetailsService,
    @inject(TYPES.UpdateEmployeeDetailsService) private _updateEmployeeDetailsService: IUpdateEmployeeDetailsService,
  ) {}

  addEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._addEmployeeService.execute(req.userId!, req.body);
      res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetEmployeesRequestDTO;
      const { employees, total } = await this._getEmployeesService.execute(req.userId!, query);
      res.status(HttpStatus.OK).json({ success: true, data: employees, total, page: query.page, limit: query.limit });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  toggleBlockEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isBlocked = await this._toggleBlockEmployeeService.execute(req.userId!, req.params.userId as string);
      res.status(HttpStatus.OK).json({ success: true, isBlocked, message: EMPLOYEE_MESSAGES.TOGGLE_BLOCK_SUCCESS(isBlocked) });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getEmployeeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._getEmployeeDetailsService.execute(req.params.userId as string);
      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateEmployeeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._updateEmployeeDetailsService.execute(req.params.userId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: EMPLOYEE_MESSAGES.UPDATE_SUCCESS, data: result });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
