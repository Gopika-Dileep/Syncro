import { injectable, inject } from 'inversify';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { IProjectRepository } from '../../interfaces/repositories/IProjectRepository';
import { IUpdateUserStoryService } from '../../interfaces/services/userStory/IUpdateUserStoryService';
import { UpdateUserStoryRequestDTO, UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { USER_STORY_MESSAGES } from '../../constants/messages';
import { UserStoryStatus } from '../../enums/UserStoryEnums';
import { ProjectStatus } from '../../enums/ProjectEnums';

@injectable()
export class UpdateUserStoryService implements IUpdateUserStoryService {
  constructor(
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
    @inject(TYPES.IProjectRepository) private _projectRepository: IProjectRepository,
  ) {}

  async execute(storyId: string, data: UpdateUserStoryRequestDTO, userId: string): Promise<UserStoryResponseDTO> {
    const updateData: Record<string, unknown> = { ...data };

    // If assigning an employee, track who is doing the assignment
    if (data.assignee_id) {
      const assigner = await this._employeeRepository.findByUserId(userId);
      if (assigner) {
        updateData.assigned_by = assigner._id;
      }
    }

    const story = await this._userStoryRepository.updateById(storyId, updateData);
    if (!story) throw new NotFoundError(USER_STORY_MESSAGES.NOT_FOUND);

    // 1. If moving TO Done, check if all stories in the project are now Done
    if (data.status === UserStoryStatus.DONE) {
      const projectStories = await this._userStoryRepository.find({ project_id: story.project_id });
      const allDone = projectStories.length > 0 && projectStories.every(s => s.status === UserStoryStatus.DONE);
      if (allDone) {
        await this._projectRepository.updateById(story.project_id.toString(), { status: ProjectStatus.COMPLETED });
      }
    } 
    // 2. If moving AWAY from Done, ensure project is marked as Active
    else if (story.status === UserStoryStatus.DONE && data.status) {
      await this._projectRepository.updateById(story.project_id.toString(), { status: ProjectStatus.ACTIVE });
    }

    // Populate for the response DTO
    await story.populate({ path: 'assignee_id', populate: { path: 'user_id' } });
    await story.populate({ path: 'created_by', populate: { path: 'user_id' } });
    await story.populate({ path: 'assigned_by', populate: { path: 'user_id' } });

    return UserStoryMapper.toResponseDTO(story);
  }
}
