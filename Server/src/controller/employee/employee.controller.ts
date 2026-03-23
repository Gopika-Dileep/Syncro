import { IEmployeeService } from "../../interfaces/services/IEmployeeService";
import { Request, Response } from "express"
import { IEmployee } from "../../models/employee.model";

export class EmployeeController {
    constructor(private _employeeService: IEmployeeService) { }

    addEmployee = async (req: Request, res: Response): Promise<void> => {
        try {
            const companyId = req.userId!

            const { name, email, designation, date_of_joining, date_of_birth, phone, address, skills,permissions } = req.body

            await this._employeeService.addEmployee(companyId, {
                name, email, designation, date_of_joining, date_of_birth, phone, address, skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(",").map((s: string) => s.trim()) : []),permissions
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
            const employees = await this._employeeService.getEmployees(companyId)
            res.status(200).json({ success: true, data: employees })
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

    getEmployeeDetails = async(req:Request,res:Response):Promise<void>=>{
        try{
            const userId = req.params.userId as string
            if(!userId){
                res.status(400).json({success:false,message:"userId required"})
                return 
            }
            const result = await this._employeeService.getEmployeeDetails(userId)
            res.status(200).json({success:true, data:result})

        }catch(err:unknown){
            const message = err instanceof Error ? err.message :"failed to get data"
            res.status(400).json({success:false , message})

        }
    }

    updateEmployeeDetails = async (req:Request , res:Response ):Promise<void> =>{
        try{
            const userId = req.params.userId as string

            const updateData :Partial<IEmployee>={
                designation : req.body.designation,
                phone:req.body.phone,
                address:req.body.address,
                skills:req.body.skills,
                date_of_joining:req.body.date_of_joining ?new Date(req.body.date_of_joining):undefined
            };
            if(!userId){
                res.status(400).json({success:false, message:"userId is required"});
                return 
            }

            const result = await this._employeeService.updateEmployeeDetails(userId,updateData);

            res.status(200).json({success:true,message:"Employee Profile updated successfully", data :result})
        }catch(err:unknown){
            const message = err instanceof Error ? err.message :"failed to get data"
            res.status(400).json({success:false , message})
        }
    }
}