import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'company' | 'employee';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
  is_blocked: boolean;
  is_verified: boolean;
  refreshToken?: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['company', 'employee'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export const userModel = mongoose.model<IUser>('User', userSchema);
