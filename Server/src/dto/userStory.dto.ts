import { z } from 'zod';
import { UserStoryStatus, UserStoryPriority, IssueType } from '../enums/UserStoryEnums';

export const UserStoryBaseSchema = z.object({
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
  priority: z.nativeEnum(UserStoryPriority),
  status: z.nativeEnum(UserStoryStatus).optional(),
  type: z.nativeEnum(IssueType).optional(),
});

export const CreateUserStoryRequestSchema = z.object({
  body: UserStoryBaseSchema,
});

export const UpdateUserStoryRequestSchema = z.object({
  params: z.object({
    storyId: z.string().min(1),
  }),
  body: UserStoryBaseSchema.partial().omit({ project_id: true }),
});

export const AssignUserStoryRequestSchema = z.object({
  params: z.object({
    storyId: z.string().min(1),
  }),
  body: z.object({
    assignee_id: z.string().nullable().optional(),
  }),
});

export type CreateUserStoryRequestDTO = z.infer<typeof CreateUserStoryRequestSchema>['body'];
export type UpdateUserStoryRequestDTO = z.infer<typeof UpdateUserStoryRequestSchema>['body'];
export type AssignUserStoryRequestDTO = z.infer<typeof AssignUserStoryRequestSchema>['body'];

export interface UserStoryResponseDTO {
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
  parent_id?: string;
  title: string;
  description?: string;
  reproduction_steps?: string;
  environment?: string;
  criteria: string[];
  story_points: number;
  priority: UserStoryPriority;
  status: UserStoryStatus;
  type: IssueType;
  created_at: string;
  updated_at: string;
}

