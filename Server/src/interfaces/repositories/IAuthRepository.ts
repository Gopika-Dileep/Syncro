import { IUser } from "../../models/user.model";


export interface IAuthRepository{
    findByEmail(email:string):Promise<IUser | null>
    createUser(name:string,email:string,hashedpassword:string,role:string):Promise<IUser>
    findById(id:string):Promise<IUser|null>
    updateRefreshToken(id:string,refreshToken:string):Promise<void>
    clearRefreshToken(id:string):Promise<void>
    updatePassword(id:string,hashedpassword:string):Promise<void>
    verifyUser(id:string):Promise<void>
    toggleBlockUser(userId:string):Promise<boolean>
}

