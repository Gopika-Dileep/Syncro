import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../enums/TaskEnums';

export const TaskBaseSchema = z.object({
  user_story_id: z.string().min(1, 'User Story ID is required'),
  sprint_id: z.string().min(1, 'Sprint ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assign_to: z.string().nullable().optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be non-negative').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be non-negative').optional(),
  rework_reason: z.string().optional(),
  branch_name: z.string().optional(),
  submission_link: z.string().url('Invalid submission link').optional().or(z.literal('')),
  submission_description: z.string().optional(),
});

export const CreateTaskRequestSchema = z.object({
  body: TaskBaseSchema.extend({
    status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
    priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
    estimated_hours: z.number().optional().default(0),
    actual_hours: z.number().optional().default(0),
  }),
});

export const UpdateTaskRequestSchema = z.object({
  params: z.object({
    taskId: z.string().min(1),
  }),
  body: TaskBaseSchema.partial(),
});

export const AssignTaskRequestSchema = z.object({
  params: z.object({
    taskId: z.string().min(1),
  }),
  body: z.object({
    assign_to: z.string().min(1, 'Assignee ID is required'),
  }),
});

export type CreateTaskRequestDTO = z.infer<typeof CreateTaskRequestSchema>['body'];
export type UpdateTaskRequestDTO = z.infer<typeof UpdateTaskRequestSchema>['body'];
export type AssignTaskRequestDTO = z.infer<typeof AssignTaskRequestSchema>['body'];

export interface TaskPersonRef {
  _id: string;
  name: string;
  avatar?: string;
  designation?: string;
  team_name?: string;
}

export interface TaskResponseDTO {
  _id: string;
  user_story_id: string;
  sprint_id: string;
  company_id: string;
  team_id?: TaskPersonRef | null;
  created_by?: TaskPersonRef | null;
  assigned_by?: TaskPersonRef | null;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assign_to?: TaskPersonRef | string | null;
  estimated_hours: number;
  actual_hours: number;
  rework_reason?: string;
  branch_name?: string;
  submission_link?: string;
  submission_description?: string;
  task_type: string;
  created_at: string;
  updated_at: string;
}
