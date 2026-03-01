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
}