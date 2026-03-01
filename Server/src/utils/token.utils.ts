import jwt from "jsonwebtoken"
import { env } from "../config/env"


export const generateAccessToken =(userId:string)=>{
    return jwt.sign({id:userId},env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"})
}

export const generateRefreshToken=(userId:string)=>{
    return jwt.sign({id:userId},env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
}

export const verifyAccessToken = (token:string):{id:string}=>{
    return jwt.verify(token,env.ACCESS_TOKEN_SECRET) as {id: string}
}

export const verifyRefreshToken = (token:string) :{id:string} =>{
    return jwt.verify(token,env.REFRESH_TOKEN_SECRET) as {id:string}
}

