import { IUser } from "../../models/user.model";

export interface IAuthRepository{
    findByEmail(email:string):Promise<IUser | null>
    create(name:string,email:string,hashedpassword:string):Promise<IUser>
}