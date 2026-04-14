import { z } from 'zod';
import { UserStoryStatus, UserStoryPriority } from '../enums/UserStoryEnums';

export const UserStoryBaseSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  criteria: z.array(z.string().min(1, 'Criteria string cannot be empty')).min(1, 'At least one criterion is required'),
  story_points: z.number().min(0, 'Story points must be non-negative'),
  priority: z.nativeEnum(UserStoryPriority),
  status: z.nativeEnum(UserStoryStatus).optional().default(UserStoryStatus.NEW),
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

export type CreateUserStoryRequestDTO = z.infer<typeof CreateUserStoryRequestSchema>['body'];
export type UpdateUserStoryRequestDTO = z.infer<typeof UpdateUserStoryRequestSchema>['body'];

export interface UserStoryResponseDTO {
  _id: string;
  project_id: string;
  title: string;
  criteria: string[];
  story_points: number;
  priority: UserStoryPriority;
  status: UserStoryStatus;
  created_at: string;
  updated_at: string;
}
