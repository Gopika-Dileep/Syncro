import mongoose, { Schema } from "mongoose";


export interface ITeam extends Document {
    name:string;
    company_id:mongoose.Types.ObjectId;
}

const teamSchema = new Schema<ITeam>({
    name:{
        type:String,
        required:true
    },
    company_id:{
        type:Schema.Types.ObjectId,
        ref:"company",
        required:true
    }
},{timestamps:true});

export const teamModel = mongoose.model<ITeam>("Team",teamSchema);