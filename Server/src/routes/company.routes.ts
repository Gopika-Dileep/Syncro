import { Router } from 'express';
import { container } from '../di/inversify.config';
import { TYPES } from '../di/types';
import { EmployeeController } from '../controller/employee.controller';
import { TeamController } from '../controller/team.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ENDPOINTS } from '../constants/endpoints';
import { validateRequest } from '../middleware/validation.middleware';
import { AddEmployeeRequestSchema, UpdateEmployeeRequestSchema, GetEmployeesRequestSchema } from '../dto/employee.dto';

const employeeController = container.get<EmployeeController>(TYPES.EmployeeController);
const teamController = container.get<TeamController>(TYPES.TeamController);

export class CompanyRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this._initializeRoutes();
  }

  private _initializeRoutes(): void {
    this.router.get(
      ENDPOINTS.COMPANY.EMPLOYEES,
      authMiddleware,
      validateRequest(GetEmployeesRequestSchema),
      employeeController.getEmployees,
    );
    this.router.post(
      ENDPOINTS.COMPANY.ADD_EMPLOYEE,
      authMiddleware,
      validateRequest(AddEmployeeRequestSchema),
      employeeController.addEmployee,
    );
    this.router.patch(ENDPOINTS.COMPANY.TOGGLE_BLOCK_EMPLOYEE, authMiddleware, employeeController.toggleBlockEmployee);
    this.router.get(ENDPOINTS.COMPANY.GET_EMPLOYEE_DETAILS, authMiddleware, employeeController.getEmployeeDetails);
    this.router.put(
      ENDPOINTS.COMPANY.UPDATE_EMPLOYEE_DETAILS,
      authMiddleware,
      validateRequest(UpdateEmployeeRequestSchema),
      employeeController.updateEmployeeDetails,
    );
    this.router.post(ENDPOINTS.COMPANY.TEAMS, authMiddleware, teamController.createTeam);
    this.router.get(ENDPOINTS.COMPANY.TEAMS, authMiddleware, teamController.getTeams);
  }
}
