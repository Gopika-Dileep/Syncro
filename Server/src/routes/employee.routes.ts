import { Router } from "express"
import { employeeController } from "../container/employee.di"
import { authMiddleware } from "../middleware/auth.middleware"

export class EmployeeRouter {
    public router: Router

    constructor() {
        this.router = Router()
        this._initializeRoutes()
    }

    private _initializeRoutes(): void {
        this.router.post("/add", authMiddleware, employeeController.addEmployee)
    }
}