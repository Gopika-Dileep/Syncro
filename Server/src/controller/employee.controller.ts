import { injectable, inject } from 'inversify';
import { IEmployeeService } from '../interfaces/services/IEmployeeService';
import { Request, Response } from 'express';
import { HttpStatus } from '../enums/HttpStatus';
import { EMPLOYEE_MESSAGES } from '../constants/messages';
import { GetEmployeesRequestDTO } from '../dto/employee.dto';
import { TYPES } from '../di/types';

@injectable()
export class EmployeeController {
  constructor(@inject(TYPES.EmployeeService) private _employeeService: IEmployeeService) { }

  addEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._employeeService.addEmployee(req.userId!, req.body);
      res.status(HttpStatus.CREATED).json({ success: true, message: result.message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.ADD_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  getEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query as unknown as GetEmployeesRequestDTO;
      const { employees, total } = await this._employeeService.getEmployees(req.userId!, query);
      res.status(HttpStatus.OK).json({ success: true, data: employees, total, page: query.page, limit: query.limit });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.FETCH_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  toggleBlockEmployee = async (req: Request, res: Response): Promise<void> => {
    try {
      const isBlocked = await this._employeeService.toggleBlockEmployee(req.userId!, req.params.userId as string);
      res.status(HttpStatus.OK).json({ success: true, isBlocked, message: EMPLOYEE_MESSAGES.TOGGLE_BLOCK_SUCCESS(isBlocked) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.FETCH_DATA_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  getEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._employeeService.getEmployeeDetails(req.params.userId as string);
      res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.FETCH_DATA_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };

  updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._employeeService.updateEmployeeDetails(req.params.userId as string, req.body);
      res.status(HttpStatus.OK).json({ success: true, message: EMPLOYEE_MESSAGES.UPDATE_SUCCESS, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.UPDATE_FAILED;
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message });
    }
  };
}
