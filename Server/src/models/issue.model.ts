import mongoose, { Schema, Document } from 'mongoose';
import { IssueStatus, IssuePriority, IssueType } from '../enums/IssueEnums';

export interface IIssue extends Document {
  project_id: mongoose.Types.ObjectId;
  company_id: mongoose.Types.ObjectId;
  sprint_id?: mongoose.Types.ObjectId;
  assignee_id?: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  assigned_by?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  reproduction_steps?: string; 
  environment?: string; 
  criteria: string[]; 
  story_points: number;
  estimated_hours: number; 
  priority: IssuePriority;
  status: IssueStatus;
  type: IssueType;
  rework_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  mentions: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    attachments?: {
      file_url: string;
      file_name: string;
    }[];
    created_at: Date;
  }[];
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
    uploaded_at: Date;
  }[];
  created_at: Date;
  updated_at: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    sprint_id: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: false,
    },
    assignee_id: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
    },
    assigned_by: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    reproduction_steps: {
      type: String,
      required: false,
    },
    environment: {
      type: String,
      required: false,
    },
    criteria: {
      type: [String],
      default: [],
    },
    story_points: {
      type: Number,
      default: 0,
    },
    estimated_hours: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: Object.values(IssuePriority),
      required: true,
      default: IssuePriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      required: true,
      default: IssueStatus.NEW,
    },
    type: {
      type: String,
      enum: Object.values(IssueType),
      required: true,
      default: IssueType.STORY,
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
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
  },

  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const issueModel = mongoose.model<IIssue>('Issue', issueSchema);
