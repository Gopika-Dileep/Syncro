import { injectable, inject } from 'inversify';
import { IEmployeeService } from '../interfaces/services/IEmployeeService';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { EMPLOYEE_MESSAGES } from '../constants/messages';
import { GetEmployeesRequestDTO } from '../dto/employee.dto';
import { TYPES } from '../di/types';
import { handleAsyncError } from '../utils/error.utils';
@injectable()
export class EmployeeController {
  constructor(@inject(TYPES.EmployeeService) private _employeeService: IEmployeeService) {}

  addEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._employeeService.addEmployee(req.userId!, req.body);
      res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GetEmployeesRequestDTO;
      const { employees, total } = await this._employeeService.getEmployees(req.userId!, query);
      res.status(HttpStatus.OK).json({ success: true, data: employees, total, page: query.page, limit: query.limit });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  toggleBlockEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isBlocked = await this._employeeService.toggleBlockEmployee(req.userId!, req.params.userId as string);
      res.status(HttpStatus.OK).json({ success: true, isBlocked, message: EMPLOYEE_MESSAGES.TOGGLE_BLOCK_SUCCESS(isBlocked) });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  getEmployeeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._employeeService.getEmployeeDetails(req.params.userId as string);
      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };

  updateEmployeeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this._employeeService.updateEmployeeDetails(req.params.userId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: EMPLOYEE_MESSAGES.UPDATE_SUCCESS, data: result });
    } catch (error) {
      handleAsyncError(error, next);
    }
  };
}
