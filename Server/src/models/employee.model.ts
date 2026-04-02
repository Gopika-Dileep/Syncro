import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmployee extends Document {
  user_id: Types.ObjectId;
  company_id: Types.ObjectId;
  team_id?: Types.ObjectId;
  designation?: string;
  date_of_joining?: Date;
  date_of_birth?: Date;
  phone?: string;
  address?: string;
  skills?: string[];
  created_at: Date;
}

export interface IPopulatedEmployee extends Omit<IEmployee, 'user_id' | 'company_id'> {
  user_id: {
    _id: string | Types.ObjectId;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    is_blocked: boolean;
  };
  company_id: {
    _id: string | Types.ObjectId;
    name: string;
  };
}

const employeeSchema = new Schema<IEmployee>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    team_id: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    designation: {
      type: String,
      default: null,
    },
    date_of_joining: {
      type: Date,
      default: null,
    },
    date_of_birth: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const employeeModel = mongoose.model<IEmployee>('Employee', employeeSchema);
