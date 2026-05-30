import { z } from 'zod';
import { IssueStatus, IssuePriority, IssueType } from '../enums/IssueEnums';

export const AttachmentSchema = z.object({
  file_url: z.string().url('Invalid file URL'),
  file_name: z.string().min(1, 'File name is required'),
});

export const AddCommentRequestSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Comment text is required'),
    attachments: z.array(AttachmentSchema).optional(),
    mentions: z.array(z.string()).optional(),
  }),
});

export const AddAttachmentRequestSchema = z.object({
  body: z.object({
    attachments: z.array(AttachmentSchema).min(1, 'At least one attachment is required'),
    mentions: z.array(z.string()).optional(),
  }),
});

export const IssueBaseSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  company_id: z.string().optional(),
  sprint_id: z.string().nullable().optional(),
  assignee_id: z.string().nullable().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  reproduction_steps: z.string().optional(),
  environment: z.string().optional(),
  criteria: z.array(z.string().min(1, 'Criteria string cannot be empty')).optional(),
  story_points: z.number().min(0, 'Story points must be non-negative').optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  priority: z.nativeEnum(IssuePriority),
  status: z.nativeEnum(IssueStatus).optional(),
  type: z.nativeEnum(IssueType).optional(),
  rework_reason: z.string().optional(),
  blocked_reason: z.string().optional(),
  branch_name: z.string().optional(),
  submission_link: z.string().optional(),
  submission_description: z.string().optional(),
  mentions: z.array(z.string().min(1)).optional(),
});

export const CreateIssueRequestSchema = z.object({
  body: IssueBaseSchema,
});

export const UpdateIssueRequestSchema = z.object({
  params: z.object({
    issueId: z.string().min(1),
  }),
  body: IssueBaseSchema.partial().omit({ project_id: true }),
});

export const AssignIssueRequestSchema = z.object({
  params: z.object({
    issueId: z.string().min(1),
  }),
  body: z.object({
    assignee_id: z.string().nullable().optional(),
    sprint_id: z.string().nullable().optional(),
  }),
});

export type CreateIssueRequestDTO = z.infer<typeof CreateIssueRequestSchema>['body'];
export type UpdateIssueRequestDTO = z.infer<typeof UpdateIssueRequestSchema>['body'];
export type AssignIssueRequestDTO = {
  issue_id: string;
  assignee_id?: string | null;
  sprint_id?: string | null;
};

export interface IssueResponseDTO {
  _id: string;
  project_id: string;
  company_id: string;
  sprint_id?: string;
  sprint_status?: string;
  assignee_id?:
    | string
    | null
    | {
        _id: string;
        user_id: {
          name: string;
        };
        designation: string;
        team_id?: string | { _id: string; name: string };
      };
  assign_to?: {
    _id: string;
    name: string;
    designation: string;
  };
  created_by?: {
    _id: string;
    name: string;
    designation: string;
  };
  assigned_by?: {
    _id: string;
    name: string;
    designation: string;
  };
  team?: {
    _id: string;
    name: string;
  };
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
  blocked_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  mentions: string[];
  comments: {
    user: { _id: string; name: string; designation: string; avatar?: string } | null;
    text: string;
    attachments?: { file_url: string; file_name: string }[];
    created_at: string;
  }[];
  attachments: {
    file_url: string;
    file_name: string;
    uploaded_by: { _id: string; name: string; designation: string; avatar?: string } | null;
    uploaded_at: string;
  }[];
  history: {
    action: string;
    from?: string;
    to?: string;
    user: { _id: string; name: string; designation: string; avatar?: string } | null;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
}
