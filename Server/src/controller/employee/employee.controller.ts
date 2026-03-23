import { IEmployeeService } from "../../interfaces/services/IEmployeeService";
import { Request, Response } from "express"
import { HttpStatus } from "../../enums/HttpStatus";
import { EMPLOYEE_MESSAGES } from "../../constants/messages";

export class EmployeeController {
    constructor(private _employeeService: IEmployeeService) { }

    addEmployee = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!

            const { name, email, phone, designation, date_of_joining, permissions } = req.body

            await this._employeeService.addEmployee(companyId, {
                name, email, phone, designation, date_of_joining, permissions
            })

            res.status(HttpStatus.CREATED).json({ success: true, message: EMPLOYEE_MESSAGES.ADD_SUCCESS })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.ADD_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }

    getEmployees = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const search = (req.query.search as string) || "";

            const { employees, total } = await this._employeeService.getEmployees(companyId, page, limit, search)
            res.status(HttpStatus.OK).json({ success: true, data: employees, total, page, limit })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.FETCH_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }

    toggleBlockEmployee = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!
            const userId = req.params.userId as string

            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: EMPLOYEE_MESSAGES.USER_ID_REQUIRED })
                return
            }
            const isBlocked = await this._employeeService.toggleBlockEmployee(companyId, userId)
            res.status(HttpStatus.OK).json({ success: true, isBlocked, message: EMPLOYEE_MESSAGES.TOGGLE_BLOCK_SUCCESS(isBlocked) })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.FETCH_DATA_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }

    getEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: EMPLOYEE_MESSAGES.USER_ID_REQUIRED })
                return
            }
            const result = await this._employeeService.getEmployeeDetails(userId)
            res.status(HttpStatus.OK).json({ success: true, data: result })

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.FETCH_DATA_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })

        }
    }

    updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: EMPLOYEE_MESSAGES.USER_ID_REQUIRED });
                return
            }

            const result = await this._employeeService.updateEmployeeDetails(userId, req.body);

            res.status(HttpStatus.OK).json({ success: true, message: EMPLOYEE_MESSAGES.UPDATE_SUCCESS, data: result })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : EMPLOYEE_MESSAGES.UPDATE_FAILED
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message })
        }
    }
}