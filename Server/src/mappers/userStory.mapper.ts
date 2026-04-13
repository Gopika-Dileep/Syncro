import { IUserStory } from '../models/userStory.model';
import { UserStoryResponseDTO } from '../dto/userStory.dto';

export class UserStoryMapper {
  static toResponseDTO(story: IUserStory): UserStoryResponseDTO {
    return {
      _id: story._id.toString(),
      project_id: story.project_id.toString(),
      title: story.title,
      criteria: story.criteria,
      story_points: story.story_points,
      priority: story.priority,
      status: story.status,
      created_at: story.created_at.toISOString(),
      updated_at: story.updated_at.toISOString(),
    };
  }

  static toResponseList(stories: IUserStory[]): UserStoryResponseDTO[] {
    return stories.map((story) => this.toResponseDTO(story));
  }
}
