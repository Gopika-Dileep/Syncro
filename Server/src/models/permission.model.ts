import mongoose, { Schema } from "mongoose";


export interface IPermission extends Document{
    user_id:mongoose.Types.ObjectId;
    company_id:mongoose.Types.ObjectId;
    permissions:mongoose.Types.ObjectId
}


const permissionSchema = new Schema<IPermission>({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    company_id:{
        type:Schema.Types.ObjectId,
        ref:"company",
        required:true
    },
    permissions:[{
        type:Schema.Types.ObjectId,
        ref:"PermissionDefinition"
    }]
},{timestamps:true})

export const permissionModel = mongoose.model<IPermission>("Permission" , permissionSchema);