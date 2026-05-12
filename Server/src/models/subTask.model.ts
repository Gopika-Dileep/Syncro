import mongoose, { Schema, Document } from 'mongoose';
import { SubTaskStatus, SubTaskPriority } from '../enums/SubTaskEnums';

export interface ISubTask extends Document {
  issue_id: mongoose.Types.ObjectId;
  sprint_id: mongoose.Types.ObjectId;
  company_id: mongoose.Types.ObjectId;
  team_id?: mongoose.Types.ObjectId;
  created_by?: mongoose.Types.ObjectId;
  assigned_by?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: SubTaskStatus;
  priority: SubTaskPriority;
  assignee_id?: mongoose.Types.ObjectId;
  estimated_hours: number;
  actual_hours: number;
  rework_reason?: string;
  blocked_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    attachments?: {
      file_url: string;
      file_name: string;
    }[];
    mentions?: mongoose.Types.ObjectId[];
    created_at: Date;
  }[];
  mentions: mongoose.Types.ObjectId[];
  history: {
    action: string;
    from?: string;
    to?: string;
    user: mongoose.Types.ObjectId;
    created_at: Date;
  }[];
  attachments: {
    file_url: string;
    file_name: string;
    uploaded_by: mongoose.Types.ObjectId;
    mentions?: mongoose.Types.ObjectId[];
    uploaded_at: Date;
  }[];
  created_at: Date;
  updated_at: Date;
}

const subTaskSchema = new Schema<ISubTask>(
  {
    issue_id: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
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
      enum: Object.values(SubTaskStatus),
      required: true,
      default: SubTaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(SubTaskPriority),
      required: true,
      default: SubTaskPriority.MEDIUM,
    },
    assignee_id: {
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
    blocked_reason: {
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
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
        text: { type: String, required: true },
        attachments: [
          {
            file_url: { type: String, required: true },
            file_name: { type: String, required: true },
          },
        ],
        mentions: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
          },
        ],
        created_at: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        action: { type: String, required: true },
        from: { type: String, required: false },
        to: { type: String, required: false },
        user: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
        created_at: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        file_url: { type: String, required: true },
        file_name: { type: String, required: true },
        uploaded_by: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
        mentions: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
          },
        ],
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const subTaskModel = mongoose.model<ISubTask>('SubTask', subTaskSchema);
