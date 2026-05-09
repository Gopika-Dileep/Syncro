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
    const formattedAttachments = attachments.map((att) => ({
      ...att,
      uploaded_by: employee?._id as unknown as import('mongoose').Types.ObjectId,
      uploaded_at: new Date(),
    }));

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      $push: {
        attachments: { $each: formattedAttachments },
      },
    });

    if (!subTask) {
      throw new NotFoundError('Sub-task not found');
    }

    return (await this._subTaskRepository.findById(subTaskId, {
      populate: [
        { path: 'comments.user', populate: { path: 'user_id', select: 'name avatar' } },
        { path: 'attachments.uploaded_by', populate: { path: 'user_id', select: 'name avatar' } },
        { path: 'team_id', select: 'name' },
        { path: 'assignee_id', populate: [{ path: 'user_id' }, { path: 'team_id' }] },
        { path: 'created_by', populate: { path: 'user_id' } },
        { path: 'assigned_by', populate: { path: 'user_id' } },
      ],
    })) as ISubTask;
  }
}
