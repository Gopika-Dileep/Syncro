import { z } from 'zod';
import { IssueStatus, IssuePriority, IssueType } from '../enums/IssueEnums';

export const IssueBaseSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  company_id: z.string().optional(),
  sprint_id: z.string().nullable().optional(),
  assignee_id: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  reproduction_steps: z.string().optional(), // For Bugs
  environment: z.string().optional(),        // For Bugs
  criteria: z.array(z.string().min(1, 'Criteria string cannot be empty')).optional(),
  story_points: z.number().min(0, 'Story points must be non-negative').optional(),
  priority: z.nativeEnum(IssuePriority),
  status: z.nativeEnum(IssueStatus).optional(),
  type: z.nativeEnum(IssueType).optional(),
  rework_reason: z.string().optional(),
  branch_name: z.string().optional(),
  submission_link: z.string().optional(),
  submission_description: z.string().optional(),
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
  }),
});

export type CreateIssueRequestDTO = z.infer<typeof CreateIssueRequestSchema>['body'];
export type UpdateIssueRequestDTO = z.infer<typeof UpdateIssueRequestSchema>['body'];
export type AssignIssueRequestDTO = z.infer<typeof AssignIssueRequestSchema>['body'];

export interface IssueResponseDTO {
  _id: string;
  project_id: string;
  company_id: string;
  sprint_id?: string;
  assignee_id?: string;
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
  parent_id?: string;
  title: string;
  description?: string;
  reproduction_steps?: string;
  environment?: string;
  criteria: string[];
  story_points: number;
  priority: IssuePriority;
  status: IssueStatus;
  type: IssueType;
  rework_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  created_at: string;
  updated_at: string;
}
