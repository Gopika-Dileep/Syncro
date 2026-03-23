import { IEmployeeService } from "../../interfaces/services/IEmployeeService";
import { Request, Response } from "express"
import { IEmployee } from "../../models/employee.model";

export class EmployeeController {
    constructor(private _employeeService: IEmployeeService) { }

    addEmployee = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!

            const { name, email, phone, designation, date_of_joining, permissions } = req.body

            await this._employeeService.addEmployee(companyId, {
                name, email, phone, designation, date_of_joining, permissions
            })

            res.status(201).json({ success: true, message: "Employee added and invitation sent" })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to add employee"
            res.status(400).json({ success: false, message })
        }
    }

    getEmployees = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const search = (req.query.search as string) || "";

            const { employees, total } = await this._employeeService.getEmployees(companyId, page, limit, search)
            res.status(200).json({ success: true, data: employees, total, page, limit })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "failed to fetch employees"
            res.status(400).json({ success: false, message })
        }
    }

    toggleBlockEmployee = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!
            const userId = req.params.userId as string

            if (!userId) {
                res.status(400).json({ success: false, message: "userId is required" })
                return
            }
            const isBlocked = await this._employeeService.toggleBlockEmployee(companyId, userId)
            res.status(200).json({ success: true, isBlocked, message: isBlocked ? "employee blocked" : "employee unblocked" })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "failed to update status"
            res.status(400).json({ success: false, message })
        }
    }

    getEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string
            if (!userId) {
                res.status(400).json({ success: false, message: "userId required" })
                return
            }
            const result = await this._employeeService.getEmployeeDetails(userId)
            res.status(200).json({ success: true, data: result })

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "failed to get data"
            res.status(400).json({ success: false, message })

        }
    }

    updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string
            if (!userId) {
                res.status(400).json({ success: false, message: "userId is required" });
                return
            }

            const result = await this._employeeService.updateEmployeeDetails(userId, req.body);

            res.status(200).json({ success: true, message: "Employee Profile updated successfully", data: result })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "failed to update data"
            res.status(400).json({ success: false, message })
        }
    }
}