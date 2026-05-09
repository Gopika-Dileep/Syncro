import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ICreateSubTaskService } from '../../interfaces/services/subTask/ICreateSubTaskService';
import { CreateSubTaskRequestDTO, SubTaskResponseDTO } from '../../dto/subTask.dto';
import { SubTaskMapper } from '../../mappers/subTask.mapper';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { BadRequestError } from '../../errors/AppError';

import { ISubTask } from '../../models/subTask.model';

@injectable()
export class CreateSubTaskService implements ICreateSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(data: CreateSubTaskRequestDTO, userId: string): Promise<SubTaskResponseDTO> {
    const creator = await this._employeeRepository.findByUserId(userId);
    if (!creator) throw new Error('Employee not found');

    const creatorTeamId = creator.team_id?._id?.toString() || creator.team_id?.toString();

    if (creatorTeamId) {
      const existingSubTasks = await this._subTaskRepository.findAllByIssueId(data.issue_id);
      const teamSubTaskCount = existingSubTasks.filter((st) => {
        const teamObj = st.team_id as unknown as { _id?: { toString(): string } };
        const stTeamId = teamObj?._id?.toString() || st.team_id?.toString();
        return stTeamId === creatorTeamId;
      }).length;

      if (teamSubTaskCount >= 4) {
        throw new BadRequestError('A team can create a maximum of 4 subtasks per user story');
      }
    }

    const subTask = await this._subTaskRepository.create({
      ...data,
      company_id: creator.company_id?._id || creator.company_id,
      team_id: creator.team_id?._id || creator.team_id,
      created_by: creator._id,
    } as unknown as ISubTask);

    return SubTaskMapper.toResponseDTO(subTask);
  }
}
