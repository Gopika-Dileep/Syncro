import { z } from 'zod';

export const CreateTeamRequestSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name cannot exceed 50 characters'),
  }),
});

export type CreateTeamRequestDTO = z.infer<typeof CreateTeamRequestSchema>['body'];

export const GetTeamsRequestSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1)),
    limit: z.preprocess((val) => Number(val) || 10, z.number().min(1)),
    search: z.string().optional().default(''),
  }),
});

export type GetTeamsRequestDTO = z.infer<typeof GetTeamsRequestSchema>['query'];

export const UpdateTeamRequestSchema = z.object({
  params: z.object({
    teamId: z.string().min(1, 'Team ID is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name cannot exceed 50 characters'),
  }),
});

export type UpdateTeamRequestDTO = z.infer<typeof UpdateTeamRequestSchema>['body'];

export interface TeamResponseDTO {
  _id: string;
  name: string;
  company_id: string;
  created_at?: string;
}

export interface MemberDTO {
  _id: string;
  name: string;
  email: string;
  designation?: string;
}

export const GetTeamDirectoryRequestSchema = z.object({
  query: z.object({
    search: z.string().optional().default(''),
  }),
});

export type GetTeamDirectoryRequestDTO = z.infer<typeof GetTeamDirectoryRequestSchema>['query'];

export interface PaginatedTeamResponseDTO {
  teams: TeamResponseDTO[];
  total: number;
}

export interface TeamDirectoryDTO {
  _id: string | 'unassigned';
  name: string;
  members: MemberDTO[];
}
