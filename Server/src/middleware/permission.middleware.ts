import { Request, Response, NextFunction } from "express";


export interface AuthenticatedRequest extends Request{
    userId?:string;
    userRole?:string;
    permissions?:string[];
}

export const checkPermission = (requiredKey:string)=>{
    return (req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
        if(req.userRole === ' company'){
            return next()
        }

        const userPermissions:string[] = req.permissions || []

        if(userPermissions.includes(requiredKey)){
            return next();
        }

        return res.status(403).json({success:false,message:`Access denied. you dont have hte permission:${requiredKey}`})
    }
}