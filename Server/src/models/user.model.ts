import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document{
    name:string,
    email:string,
    password:string
}

const userSchema  = new Schema<IUser>(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        }
    },
    {timestamps:true}
)

export const userModel = mongoose.model<IUser>("User",userSchema)