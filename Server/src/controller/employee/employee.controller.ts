import { IEmployeeService } from "../../interfaces/services/IEmployeeService";
import { Request, Response } from "express"

export class EmployeeController {
    constructor (private _employeeService:IEmployeeService){}

    addEmployee = async (req:Request,res:Response):Promise<void> =>{
        try{
            const adminUserId = req.userId!

            const { name,email,designation,date_of_joining , date_of_birth, phone,address,skills} = req.body

            await this._employeeService.addEmployee(adminUserId,{
                name,email,designation,date_of_joining,date_of_birth,phone,address,skills:skills?skills.split(",").map((s:string)=>s.trim()):[]
            })

            res.status(201).json({success:true,message:"Employee added and invitation sent"})
        }catch (err:unknown){
            const message = err instanceof Error? err.message:"Failed to add employee" 
            res.status(400).json({success:false,message})
        }
    }

    getEmployees = async (req:Request, res:Response):Promise<void>=>{
        try{
            const adminUserId = req.userId!
            const employees = await this._employeeService.getEmployees(adminUserId)
            res.status(200).json({success:true ,data :employees})
        }catch(err:unknown){
            const message = err instanceof Error? err.message: "failed to fetch employees"
            res.status(400).json({success:false,message})
        }
    }

    toggleBlockEmployee = async (req:Request,res:Response):Promise<void> =>{
        try{
            const adminUserId = req.userId!
            const userId = req.params.userId as string

            if(!userId){
                res.status(400).json({success:false,message:"userId is required"})
                return 
            }
            const isBlocked = await this._employeeService.toggleBlockEmployee(adminUserId,userId)
            res.status(200).json({success:true, isBlocked , message: isBlocked?"employee blocked":"employee unblocked"})
        }catch (err:unknown){
            const message = err instanceof Error? err.message:"failed to update status"
            res.status(400).json({success:false,message})
        }
    }
}