import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { IUser, userModel } from "../models/user.model";

export class AuthRepository implements IAuthRepository{
    async findByEmail(email: string): Promise<IUser | null> {
        return userModel.findOne({email});
    }

    async createUser(name: string, email: string, hashedpassword: string, role:string): Promise<IUser> {
        return userModel.create({name,email,password:hashedpassword, role})
    }


    async findById(id: string): Promise<IUser | null> {
        return userModel.findById(id)
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
        await userModel.findByIdAndUpdate(id,{refreshToken})
    }

    async clearRefreshToken(id: string): Promise<void> {
        await userModel.findByIdAndUpdate(id,{refreshToken:null})
    }

    async updatePassword(id: string, hashedpassword: string): Promise<void> {
        await userModel.findByIdAndUpdate(id,{password:hashedpassword})
    }

    async verifyUser(id: string): Promise<void> {
        await userModel.findByIdAndUpdate(id,{is_verified:true})
    }

    async toggleBlockUser(userId:string):Promise<boolean>{
        const user = await userModel.findById(userId)
        if(!user) throw new Error("user not found")

            const newStatus = !user.is_blocked
            await userModel.findByIdAndUpdate(userId,{is_blocked:newStatus})
            return newStatus
    }

    async updateUser(userId: string, data: { name?: string; email?: string; }): Promise<IUser | null> {
        return await userModel.findByIdAndUpdate(userId,{$set:data},{new:true})
    }
}  