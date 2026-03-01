import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { companyModel, ICompany } from "../models/company.model";
import { IUser, userModel } from "../models/user.model";

export class AuthRepository implements IAuthRepository{
    async findByEmail(email: string): Promise<IUser | null> {
        return userModel.findOne({email});
    }

    async createUser(name: string, email: string, hashedpassword: string, role:string): Promise<IUser> {
        return userModel.create({name,email,password:hashedpassword,role})
    }

    async createCompany(userId:string,companyName:string):Promise<ICompany>{
        return companyModel.create({user_id:userId, name: companyName})
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
}  