import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, TaskPriority } from '../enums/TaskEnums';

export interface ITask extends Document {
  user_story_id: mongoose.Types.ObjectId;
  sprint_id: mongoose.Types.ObjectId;
  company_id: mongoose.Types.ObjectId;
  team_id?: mongoose.Types.ObjectId;
  created_by?: mongoose.Types.ObjectId;
  assigned_by?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assign_to?: mongoose.Types.ObjectId;
  estimated_hours: number;
  actual_hours: number;
  rework_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  created_at: Date;
  updated_at: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user_story_id: {
      type: Schema.Types.ObjectId,
      ref: 'UserStory',
      required: true,
    },
    sprint_id: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
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
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    assigned_by: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      required: true,
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      required: true,
      default: TaskPriority.MEDIUM,
    },
    assign_to: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
    },
    estimated_hours: {
      type: Number,
      required: true,
      default: 0,
    },
    actual_hours: {
      type: Number,
      required: true,
      default: 0,
    },
    rework_reason: {
      type: String,
      required: false,
    },
    branch_name: {
      type: String,
      required: false,
    },
    submission_link: {
      type: String,
      required: false,
    },
    submission_description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const taskModel = mongoose.model<ITask>('Task', taskSchema);
