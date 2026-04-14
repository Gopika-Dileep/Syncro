import { injectable, inject } from 'inversify';
import { Types } from 'mongoose';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { ICreateUserStoryService } from '../../interfaces/services/userStory/ICreateUserStoryService';
import { CreateUserStoryRequestDTO, UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';

@injectable()
export class CreateUserStoryService implements ICreateUserStoryService {
  constructor(
    @inject(TYPES.UserStoryRepository) private _userStoryRepository: IUserStoryRepository,
  ) {}

  async execute(data: CreateUserStoryRequestDTO): Promise<UserStoryResponseDTO> {
    const userStory = await this._userStoryRepository.create({
      ...data,
      project_id: new Types.ObjectId(data.project_id),
    });
    return UserStoryMapper.toResponseDTO(userStory);
  }
}
