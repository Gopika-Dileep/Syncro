import { ISubTask } from '../../../models/subTask.model';

export interface IAddCommentToSubTaskService {
  execute(subTaskId: string, userId: string, text: string): Promise<ISubTask>;
}
