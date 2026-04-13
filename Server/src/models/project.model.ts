import mongoose, { Schema, Document } from 'mongoose';
import { ProjectStatus, ProjectPriority } from '../enums/ProjectEnums';

export interface IProject extends Document {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  company_id: mongoose.Types.ObjectId;
  start_date: Date;
  target_date: Date;
  created_at: Date;
  updated_at: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      required: true,
      default: ProjectStatus.ACTIVE,
    },
    priority: {
      type: String,
      enum: Object.values(ProjectPriority),
      required: true,
      default: ProjectPriority.MEDIUM,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    target_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const projectModel = mongoose.model<IProject>('Project', projectSchema);
