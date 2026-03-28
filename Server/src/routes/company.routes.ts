import { Router } from "express"
import { employeeController } from "../container/employee.di"
import { authMiddleware } from "../middleware/auth.middleware"
import { teamController } from "../container/team.di"
import { ENDPOINTS } from "../constants/endpoints";
import { validateRequest } from "../middleware/validation.middleware";
import { AddEmployeeRequestSchema, UpdateEmployeeRequestSchema, GetEmployeesRequestSchema } from "../dto/employee.dto";

export class CompanyRouter {
    public router: Router

    constructor() {
        this.router = Router()
        this._initializeRoutes()
    }

    private _initializeRoutes(): void {
        this.router.get(ENDPOINTS.COMPANY.EMPLOYEES, authMiddleware, validateRequest(GetEmployeesRequestSchema), employeeController.getEmployees)
        this.router.post(ENDPOINTS.COMPANY.ADD_EMPLOYEE, authMiddleware, validateRequest(AddEmployeeRequestSchema), employeeController.addEmployee)
        this.router.patch(ENDPOINTS.COMPANY.TOGGLE_BLOCK_EMPLOYEE, authMiddleware, employeeController.toggleBlockEmployee)
        this.router.get(ENDPOINTS.COMPANY.GET_EMPLOYEE_DETAILS, authMiddleware, employeeController.getEmployeeDetails)
        this.router.put(ENDPOINTS.COMPANY.UPDATE_EMPLOYEE_DETAILS, authMiddleware, validateRequest(UpdateEmployeeRequestSchema), employeeController.updateEmployeeDetails)
        this.router.post(ENDPOINTS.COMPANY.TEAMS, authMiddleware, teamController.createTeam);
        this.router.get(ENDPOINTS.COMPANY.TEAMS, authMiddleware, teamController.getTeams);
    }
}