import { z } from 'zod';
import { SubTaskStatus, SubTaskPriority } from '../enums/SubTaskEnums';

export const SubTaskBaseSchema = z.object({
  issue_id: z.string().min(1, 'Issue ID is required'),
  sprint_id: z.string().min(1, 'Sprint ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(SubTaskStatus).optional(),
  priority: z.nativeEnum(SubTaskPriority).optional(),
  assignee_id: z.string().nullable().optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be non-negative').optional(),
  rework_reason: z.string().optional(),
  branch_name: z.string().optional(),
  submission_link: z.string().url('Invalid submission link').optional().or(z.literal('')),
  submission_description: z.string().optional(),
});

export const CreateSubTaskRequestSchema = z.object({
  body: SubTaskBaseSchema.extend({
    status: z.nativeEnum(SubTaskStatus).optional().default(SubTaskStatus.TODO),
    priority: z.nativeEnum(SubTaskPriority).optional().default(SubTaskPriority.MEDIUM),
    estimated_hours: z.number().optional().default(0),
    actual_hours: z.number().optional().default(0),
  }),
});

export const UpdateSubTaskRequestSchema = z.object({
  params: z.object({
    subTaskId: z.string().min(1),
  }),
  body: SubTaskBaseSchema.partial(),
});

export const AssignSubTaskRequestSchema = z.object({
  params: z.object({
    subTaskId: z.string().min(1),
  }),
  body: z.object({
    assignee_id: z.string().min(1, 'Assignee ID is required'),
  }),
});

export const SubmitSubTaskRequestSchema = z.object({
  params: z.object({
    subTaskId: z.string().min(1),
  }),
  body: z.object({
    submission_link: z.string().url('Invalid link').optional().or(z.literal('')),
    submission_description: z.string().optional(),
    branch_name: z.string().optional(),
  }),
});

export const ReviewSubTaskRequestSchema = z.object({
  params: z.object({
    subTaskId: z.string().min(1),
  }),
  body: z.object({
    action: z.enum(['approve', 'reject']),
    rework_reason: z.string().optional(),
  }),
});

export type CreateSubTaskRequestDTO = z.infer<typeof CreateSubTaskRequestSchema>['body'];
export type UpdateSubTaskRequestDTO = z.infer<typeof UpdateSubTaskRequestSchema>['body'];
export type AssignSubTaskRequestDTO = z.infer<typeof AssignSubTaskRequestSchema>['body'];
export type SubmitSubTaskRequestDTO = z.infer<typeof SubmitSubTaskRequestSchema>['body'];
export type ReviewSubTaskRequestDTO = z.infer<typeof ReviewSubTaskRequestSchema>['body'];

export interface SubTaskPersonRef {
  _id: string;
  name: string;
  avatar?: string;
  designation?: string;
  team_name?: string;
}

export interface SubTaskResponseDTO {
  _id: string;
  issue_id: string;
  sprint_id: string;
  company_id: string;
  team_id?: SubTaskPersonRef | null;
  created_by?: SubTaskPersonRef | null;
  assigned_by?: SubTaskPersonRef | null;
  title: string;
  description?: string;
  status: SubTaskStatus;
  priority: SubTaskPriority;
  assignee_id?: SubTaskPersonRef | string | null;
  estimated_hours: number;
  actual_hours: number;
  rework_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  subtask_type: string;
  comments: {
    user: SubTaskPersonRef | null;
    text: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
}
