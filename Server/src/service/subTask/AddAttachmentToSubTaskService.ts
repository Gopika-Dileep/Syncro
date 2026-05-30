import { injectable, inject } from 'inversify';
import { IAddAttachmentToSubTaskService } from '../../interfaces/services/subTask/IAddAttachmentToSubTaskService';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ISubTask } from '../../models/subTask.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AddAttachmentToSubTaskService implements IAddAttachmentToSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, userId: string, attachments: { file_url: string; file_name: string }[]): Promise<ISubTask> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const formattedAttachments = attachments.map((att) => ({
      ...att,
      uploaded_by: String(employee._id),
      uploaded_at: new Date(),
    }));

    const updatedSubTask = await this._subTaskRepository.addAttachments(subTaskId, formattedAttachments);

    if (!updatedSubTask) {
      throw new NotFoundError('Sub-task not found');
    }

    return updatedSubTask;
  }
}
