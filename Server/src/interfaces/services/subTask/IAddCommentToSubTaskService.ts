import { ISubTask } from '../../../models/subTask.model';

export interface IAddCommentToSubTaskService {
  execute(subTaskId: string, userId: string, text: string, attachments?: { file_url: string; file_name: string }[]): Promise<ISubTask>;
}
