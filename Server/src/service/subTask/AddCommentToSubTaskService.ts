import { injectable, inject } from 'inversify';
import { IAddCommentToSubTaskService } from '../../interfaces/services/subTask/IAddCommentToSubTaskService';
import { ISubTaskRepository } from '../../interfaces/repositories/ISubTaskRepository';
import { ISubTask } from '../../models/subTask.model';
import { TYPES } from '../../di/types';
import { NotFoundError } from '../../errors/AppError';
import { IEmployeeRepository } from '../../interfaces/repositories/IEmployeeRepository';

@injectable()
export class AddCommentToSubTaskService implements IAddCommentToSubTaskService {
  constructor(
    @inject(TYPES.ISubTaskRepository) private _subTaskRepository: ISubTaskRepository,
    @inject(TYPES.IEmployeeRepository) private _employeeRepository: IEmployeeRepository,
  ) {}

  async execute(subTaskId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<ISubTask> {
    const employee = await this._employeeRepository.findOne({ user_id: userId });
    const actorId = employee?._id || userId;

    const subTask = await this._subTaskRepository.updateById(subTaskId, {
      $push: {
        comments: {
          user: actorId,
          text,
          attachments,
          created_at: new Date(),
        },
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
