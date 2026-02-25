import { Request, Response } from "express";
import { IAuthService } from "../../interfaces/services/IAuthService";

export class AuthController {
    constructor(private _authService: IAuthService) { }

    register = async (req: Request, res: Response): Promise<void> => {
        try{
            const {name,email,password} = req.body
            const result = await this._authService.registration(name,email,password)
            res.status(201).json({success:true,token:result.token})
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Registration failed";
            res.status(400).json({ success: false, message });
        }
    }
    login = async (req:Request,res:Response):Promise<void>=>{
        try{
            const {email,password} = req.body
            const result =  await this._authService.login(email,password)
            res.status(200).json({success:true,token:result.token})
        }catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed";
            res.status(400).json({ success: false, message });
        }
    }
}