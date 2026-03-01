import mongoose, { Document, Schema, Types } from "mongoose"

export interface ICompany extends Document {
    user_id:    Types.ObjectId     
    name:       string
    about_us?:  string
    is_active:  boolean
    created_at: Date
    updated_at: Date
}

const companySchema = new Schema<ICompany>(
    {
        user_id: {
            type:     Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },
        name: {
            type:     String,
            required: true,
        },
        about_us: {
            type:    String,
            default: null,
        },
        is_active: {
            type:    Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

export const companyModel = mongoose.model<ICompany>("Company", companySchema)
