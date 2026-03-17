import mongoose,{Schema , Document} from "mongoose";



export interface IpermissionDefinition extends Document {
    module :string;
    action :string;
    scope:string;
    permission_key:string;
}

const permissionDefinitionSchema = new Schema<IpermissionDefinition>({
    module:{
        type:String,
        required:true
    },
    action:{
        type:String,
        required:true
    },
    scope:{
        type:String,
        required:true
    },
    permission_key:{
        type:String,
        required:true,
        unique:true
    }
})

export const permissionDefinitionModel = mongoose.model<IpermissionDefinition>("PermissionDefinition" , permissionDefinitionSchema)