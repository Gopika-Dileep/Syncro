import { z } from 'zod';
import { SprintStatus } from '../enums/SprintEnums';
import { IssueResponseDTO } from './issue.dto';

export const SprintBaseSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sprint_number: z.number().min(1, 'Sprint number must be at least 1'),
  goal: z.string().min(2, 'Goal must be at least 2 characters'),
  total_points: z.number().min(0, 'Total points must be non-negative'),
  status: z.nativeEnum(SprintStatus).optional().default(SprintStatus.PLANNED),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date',
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date',
  }),
});

export const CreateSprintRequestSchema = z.object({
  body: SprintBaseSchema,
});

export const GetSprintRequestSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)),
    limit: z.preprocess((val) => Number(val) || 5, z.number().min(1)),
    search: z.string().optional().default(''),
    status: z.string().optional(),
  }),
});

export const UpdateSprintRequestSchema = z.object({
  params: z.object({
    sprintId: z.string().min(1),
  }),
  body: SprintBaseSchema.partial().extend({
    moveIssuesTo: z.string().optional(),
  }),
});

export const SprintIdParamSchema = z.object({
  params: z.object({
    sprintId: z.string().min(1),
  }),
});

export type CreateSprintRequestDTO = z.infer<typeof CreateSprintRequestSchema>['body'];
export type GetSprintRequestDTO = z.infer<typeof GetSprintRequestSchema>['query'];
export type UpdateSprintRequestDTO = z.infer<typeof UpdateSprintRequestSchema>['body'];

export interface SprintResponseDTO {
  _id: string;
  company_id: string;
  project_id: string;
  name: string;
  sprint_number: number;
  goal: string;
  total_points: number;
  committed_points: number;
  completed_points: number;
  item_count: number;
  status: SprintStatus;
  start_date: string;
  end_date: string;
  issues?: IssueResponseDTO[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedSprintResponseDTO {
  sprints: SprintResponseDTO[];
  total: number;
}

export interface VelocityDataPoint {
  sprintName: string;
  committed: number;
  completed: number;
}

export interface TeamVelocity {
  teamName: string;
  completed: number;
}

export interface VelocityAnalyticsResponse {
  sprintWise: VelocityDataPoint[];
  multipleTeam: TeamVelocity[];
}
