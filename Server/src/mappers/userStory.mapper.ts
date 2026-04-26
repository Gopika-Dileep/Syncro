import { IUserStory } from '../models/userStory.model';
import { UserStoryResponseDTO } from '../dto/userStory.dto';

function extractEmployee(ref: unknown) {
  if (!ref) return undefined;
  const obj = ref as Record<string, unknown>;
  // If populated employee: { _id, user_id: { name, ... }, designation }
  if (obj.user_id && typeof obj.user_id === 'object') {
    const userObj = obj.user_id as Record<string, unknown>;
    return {
      _id: (obj._id as string | object).toString(),
      name: (userObj.name as string) || '',
      designation: (obj.designation as string) || '',
    };
  }
  return undefined;
}

export class UserStoryMapper {
  static toResponseDTO(story: IUserStory): UserStoryResponseDTO {
    const s = story as unknown as Record<string, unknown>;
    return {
      _id: story._id.toString(),
      project_id: story.project_id.toString(),
      company_id: story.company_id?.toString() ?? '',
      sprint_id: story.sprint_id?.toString(),
      assignee_id: (s.assignee_id as Record<string, unknown>)?._id?.toString() || (s.assignee_id as string)?.toString(),
      assign_to: extractEmployee(s.assignee_id),
      created_by: extractEmployee(s.created_by),
      assigned_by: extractEmployee(s.assigned_by),
      parent_id: story.parent_id?.toString(),
      title: story.title,
      description: story.description,
      reproduction_steps: story.reproduction_steps,
      environment: story.environment,
      criteria: story.criteria,
      story_points: story.story_points,
      priority: story.priority,
      status: story.status,
      type: story.type,
      created_at: story.created_at.toISOString(),
      updated_at: story.updated_at.toISOString(),
    };
  }

  static toResponseList(stories: IUserStory[]): UserStoryResponseDTO[] {
    return stories.map((story) => this.toResponseDTO(story));
  }
}
