import { IAuthRepository } from "../interfaces/repositories/IAuthRepository";
import { IUser, userModel } from "../models/user.model";

export class AuthRepository implements IAuthRepository{
    async findByEmail(email: string): Promise<IUser | null> {
        return userModel.findOne({email});
    }

    async create(name: string, email: string, hashedpassword: string): Promise<IUser> {
        return userModel.create({name,email,password:hashedpassword})
    }

}  