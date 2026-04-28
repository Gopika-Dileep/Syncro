import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { IDeleteSubTaskService } from '../../interfaces/services/subTask/IDeleteSubTaskService';

@injectable()
export class DeleteSubTaskService implements IDeleteSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository
  ) {}

  async execute(subTaskId: string): Promise<void> {
    await this._subTaskRepository.deleteById(subTaskId);
  }
}
