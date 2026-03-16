import { verifyAccessToken } from "../utils/token.utils"
import { Request, Response, NextFunction } from "express"

declare global {
    namespace Express {
        interface Request {
            userId?:string;
            userRole?:string;
            permissions?:string[];
        }
    }
}

export const authMiddleware = (req:Request, res:Response,next:NextFunction):void=>{
    try{
        const authHeader = req.headers.authorization

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({success:false,message:"NO token provided"})
            return 
        }
        const token = authHeader.split(" ")[1]
        if(!token) return 
        
        const decoded = verifyAccessToken(token)
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.permissions = decoded.permissions || [];
        next()
    }catch{
        res.status(401).json({success: false, message: "invalid or expired token "})
    }
}