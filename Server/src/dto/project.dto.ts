import { z } from 'zod';
import { ProjectStatus, ProjectPriority } from '../enums/ProjectEnums';

export const ProjectBaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .regex(/^[^0-9]/, 'Project name cannot start with a number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  status: z.nativeEnum(ProjectStatus),
  priority: z.nativeEnum(ProjectPriority),
  start_date: z.string().min(1, 'Start date is required'),
  target_date: z.string().min(1, 'Target date is required'),
});

export const ProjectSchema = ProjectBaseSchema.refine(
  (data) => {
    const start = new Date(data.start_date);
    const target = new Date(data.target_date);
    return target > start;
  },
  {
    message: 'Target date must be at least one day after start date',
    path: ['target_date'],
  },
);

export const CreateProjectRequestSchema = z.object({
  body: ProjectSchema,
});

export const UpdateProjectRequestSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: ProjectBaseSchema.partial(),
});

export const GetProjectsRequestSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)),
    search: z.string().optional().default(''),
    status: z.string().optional(),
  }),
});

export type CreateProjectRequestDTO = z.infer<typeof CreateProjectRequestSchema>['body'];
export type UpdateProjectRequestDTO = z.infer<typeof UpdateProjectRequestSchema>['body'];
export type GetProjectsRequestDTO = z.infer<typeof GetProjectsRequestSchema>['query'];

export interface ProjectResponseDTO {
  _id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  company_id: string;
  start_date: string;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedProjectResponseDTO {
  projects: ProjectResponseDTO[];
  total: number;
}
