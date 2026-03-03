import { Router } from "express"
import { employeeController } from "../container/employee.di"
import { authMiddleware } from "../middleware/auth.middleware"

export class CompanyRouter {
    public router: Router

    constructor() {
        this.router = Router()
        this._initializeRoutes()
    }

    private _initializeRoutes(): void {
        this.router.get("/employees", authMiddleware, employeeController.getEmployees)
        this.router.post("/employee/add", authMiddleware, employeeController.addEmployee)
        this.router.patch("/employee/:userId/toggle-block",authMiddleware,employeeController.toggleBlockEmployee)
        
    }
}