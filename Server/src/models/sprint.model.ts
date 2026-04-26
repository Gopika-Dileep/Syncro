import mongoose, { Schema, Document } from 'mongoose';
import { SprintStatus } from '../enums/SprintEnums';

export interface ISprint extends Document {
  company_id: mongoose.Types.ObjectId;
  project_id: mongoose.Types.ObjectId;
  name: string;
  sprint_number: number;
  goal: string;
  total_points: number;
  status: SprintStatus;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sprint_number: {
      type: Number,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    total_points: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(SprintStatus),
      required: true,
      default: SprintStatus.PLANNED,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const sprintModel = mongoose.model<ISprint>('Sprint', sprintSchema);
