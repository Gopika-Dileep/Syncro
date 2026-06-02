import { injectable, inject } from 'inversify';
import { IAddAttachmentToSubTaskService } from '../../interfaces/services/subTask/IAddAttachmentToSubTaskService';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ISubTask } from '../../models/subTask.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';
import { EMPLOYEE_MESSAGES, SUBTASK_MESSAGES } from '../../constants/messages';

@injectable()
export class AddAttachmentToSubTaskService implements IAddAttachmentToSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, userId: string, attachments: { file_url: string; file_name: string }[]): Promise<ISubTask> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    if (!employee) {
      throw new NotFoundError(EMPLOYEE_MESSAGES.NOT_FOUND);
    }

    const formattedAttachments = attachments.map((att) => ({
      ...att,
      uploaded_by: String(employee._id),
      uploaded_at: new Date(),
    }));

    const updatedSubTask = await this._subTaskRepository.addAttachments(subTaskId, formattedAttachments);

    if (!updatedSubTask) {
      throw new NotFoundError(SUBTASK_MESSAGES.NOT_FOUND);
    }

    return updatedSubTask;
  }
}
