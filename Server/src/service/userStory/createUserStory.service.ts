import { injectable, inject } from 'inversify';
import mongoose from 'mongoose';
import { IUserStoryRepository } from '../../interfaces/repositories/IUserStoryRepository';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { ICreateUserStoryService } from '../../interfaces/services/userStory/ICreateUserStoryService';
import { CreateUserStoryRequestDTO, UserStoryResponseDTO } from '../../dto/userStory.dto';
import { UserStoryMapper } from '../../mappers/userStory.mapper';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';

@injectable()
export class CreateUserStoryService implements ICreateUserStoryService {
  constructor(
    @inject(TYPES.IUserStoryRepository) private _userStoryRepository: IUserStoryRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(data: CreateUserStoryRequestDTO, userId: string): Promise<UserStoryResponseDTO> {
    const employee = await this._employeeRepository.findByUserId(userId);
    if (!employee) throw new NotFoundError('Employee profile not found');

    const companyId = employee.company_id._id.toString();

    const userStory = await this._userStoryRepository.create({
      ...data,
      company_id: new mongoose.Types.ObjectId(companyId),
      created_by: employee._id as unknown as mongoose.Types.ObjectId,
    });
    
    return UserStoryMapper.toResponseDTO(userStory);
  }
}
